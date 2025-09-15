import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '@/lib/db';
import Payment from '@/models/Payment';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16', 
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Общая функция для создания/обновления платежа
async function handlePaymentStatus(
  sessionId: string,
  status: 'succeeded' | 'failed' | 'canceled',
  paymentData: {
    user?: string;
    email?: string;
    amount: number;
    currency: string;
    paymentIntentId?: string;
  }
) {
  try {
    // Сначала пытаемся найти и обновить существующий платеж
    const existingPayment = await Payment.findOneAndUpdate(
      { sessionId },
      { status },
      { new: true }
    );

    if (!existingPayment) {
      // Если платеж не найден, создаем новый
      const payment = new Payment({
        user: paymentData.user || undefined,
        email: paymentData.email || undefined,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status,
        sessionId,
        paymentIntentId: paymentData.paymentIntentId || undefined,
      });

      await payment.save();
      console.log(`${status} payment saved:`, sessionId);
    } else {
      console.log(`Payment status updated to ${status}:`, sessionId);
    }
  } catch (error) {
    console.error(`Error handling ${status} payment:`, error);
    throw error;
  }
}

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

    await dbConnect();

    // Обрабатываем успешные платежи
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      await handlePaymentStatus(session.id, 'succeeded', {
        user: session.metadata?.userId,
        email: session.metadata?.userEmail || session.customer_details?.email || undefined,
        amount: session.amount_total || 0,
        currency: session.currency || 'usd',
        paymentIntentId: session.payment_intent as string,
      });
    }

    // Обрабатываем неуспешные платежи через payment_intent
    else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      await handlePaymentStatus(
        paymentIntent.metadata?.sessionId || `failed_${paymentIntent.id}`,
        'failed',
        {
          user: paymentIntent.metadata?.userId,
          email: paymentIntent.receipt_email || undefined,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          paymentIntentId: paymentIntent.id,
        }
      );
    }

    // Обрабатываем неуспешные платежи через checkout session
    else if (event.type === 'checkout.session.async_payment_failed') {
      const session = event.data.object as Stripe.Checkout.Session;

      await handlePaymentStatus(session.id, 'failed', {
        user: session.metadata?.userId,
        email: session.metadata?.userEmail || session.customer_details?.email || undefined,
        amount: session.amount_total || 0,
        currency: session.currency || 'usd',
        paymentIntentId: session.payment_intent as string,
      });
    }

    // Обрабатываем истекшие сессии
    else if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;

      await handlePaymentStatus(session.id, 'canceled', {
        user: session.metadata?.userId,
        email: session.metadata?.userEmail || session.customer_details?.email || undefined,
        amount: session.amount_total || 0,
        currency: session.currency || 'usd',
      });
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
