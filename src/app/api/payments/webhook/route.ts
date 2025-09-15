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
      // Проверяем подпись Stripe
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
   else if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      await dbConnect();

      try {
        const payment = new Payment({
          user: session.metadata?.userId || undefined,
          email: session.metadata?.userEmail || session.customer_details?.email || null,
          amount: session.amount_total || 0,
          currency: session.currency || 'usd',
          status: 'canceled',
          sessionId: session.id,
        });

        await payment.save();
        console.log('Canceled payment saved:', session.id);

      } catch (dbError) {
        console.error('Error saving canceled payment:', dbError);
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
