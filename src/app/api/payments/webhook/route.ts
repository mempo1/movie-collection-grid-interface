import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '@/lib/db';
import Payment from '@/models/Payment';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16', 
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    // Читаем сырое тело запроса
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      // Включаем проверку подписи для безопасности
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    console.log('Received Stripe webhook event:', event.type);

    // Обрабатываем событие checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      await dbConnect();

      try {
        // Получаем данные из метаданных и сессии
        const userId = session.metadata?.userId || null;
        const userEmail = session.metadata?.userEmail || session.customer_details?.email || null;
        
        // Создаем запись о платеже
        const payment = new Payment({
          user: userId ? userId : undefined,
          email: userEmail,
          amount: session.amount_total || 0,
          currency: session.currency || 'usd',
          status: 'succeeded',
          sessionId: session.id,
          paymentIntentId: session.payment_intent as string || undefined,
        });

        await payment.save();
        
        console.log('Payment saved successfully:', {
          sessionId: session.id,
          amount: session.amount_total,
          userId,
          email: userEmail
        });

      } catch (dbError) {
        console.error('Error saving payment to database:', dbError);
        // Возвращаем 200, чтобы Stripe не повторял webhook
        // но логируем ошибку для мониторинга
        return NextResponse.json(
          { received: true, error: 'Database error' },
          { status: 200 }
        );
      }
    }

    // Обрабатываем событие payment_intent.succeeded (дополнительная проверка)
    else if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      await dbConnect();

      try {
        // Обновляем статус платежа, если он существует
        await Payment.findOneAndUpdate(
          { paymentIntentId: paymentIntent.id },
          { status: 'succeeded' },
          { new: true }
        );

        console.log('Payment status updated to succeeded:', paymentIntent.id);

      } catch (dbError) {
        console.error('Error updating payment status:', dbError);
      }
    }

    // Обрабатываем неудачные платежи
    else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      await dbConnect();

      try {
        // Сначала пытаемся обновить существующий платеж
        const updatedPayment = await Payment.findOneAndUpdate(
          { paymentIntentId: paymentIntent.id },
          { status: 'failed' },
          { new: true }
        );

        // Если платеж не найден, создаем новый
        if (!updatedPayment) {
          const payment = new Payment({
            user: paymentIntent.metadata?.userId || undefined,
            email: paymentIntent.receipt_email || undefined,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: 'failed',
            sessionId: paymentIntent.metadata?.sessionId || `failed_${paymentIntent.id}`,
            paymentIntentId: paymentIntent.id,
          });

          await payment.save();
          console.log('Failed payment saved:', paymentIntent.id);
        } else {
          console.log('Payment status updated to failed:', paymentIntent.id);
        }

      } catch (dbError) {
        console.error('Error handling failed payment:', dbError);
      }
    }

    // Обрабатываем async payment failed
    else if (event.type === 'checkout.session.async_payment_failed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      await dbConnect();

      try {
        // Сначала пытаемся найти и обновить существующий платеж
        const existingPayment = await Payment.findOneAndUpdate(
          { sessionId: session.id },
          { status: 'failed' },
          { new: true }
        );

        // Если платеж не найден, создаем новый
        if (!existingPayment) {
          const payment = new Payment({
            user: session.metadata?.userId || undefined,
            email: session.metadata?.userEmail || session.customer_details?.email || null,
            amount: session.amount_total || 0,
            currency: session.currency || 'usd',
            status: 'failed',
            sessionId: session.id,
            paymentIntentId: session.payment_intent as string || undefined,
          });

          await payment.save();
          console.log('Async failed payment saved:', session.id);
        } else {
          console.log('Payment status updated to failed (async):', session.id);
        }

      } catch (dbError) {
        console.error('Error saving async failed payment:', dbError);
      }
    }

    // Обрабатываем отмененные/истекшие сессии
    else if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      await dbConnect();

      try {
        // Проверяем, не существует ли уже запись
        const existingPayment = await Payment.findOne({ sessionId: session.id });
        
        if (!existingPayment) {
          const payment = new Payment({
            user: session.metadata?.userId || undefined,
            email: session.metadata?.userEmail || session.customer_details?.email || null,
            amount: session.amount_total || 0,
            currency: session.currency || 'usd',
            status: 'canceled',
            sessionId: session.id,
          });

          await payment.save();
          console.log('Expired payment saved:', session.id);
        } else {
          // Обновляем статус существующего платежа
          await Payment.findOneAndUpdate(
            { sessionId: session.id },
            { status: 'canceled' },
            { new: true }
          );
          console.log('Payment status updated to canceled:', session.id);
        }

      } catch (dbError) {
        console.error('Error handling expired payment:', dbError);
      }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
