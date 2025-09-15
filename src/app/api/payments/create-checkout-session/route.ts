import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16', 
});

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'usd' } = await request.json();

    // Валидация суммы
    if (!amount || typeof amount !== 'number' || amount < 50) {
      return NextResponse.json(
        { error: 'Amount must be at least 50 cents' },
        { status: 400 }
      );
    }

    // Получаем сессию пользователя
    const session = await getServerSession(authOptions);
    
    // Определяем APP_URL для редиректов
    const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // Создаем метаданные для Stripe
    const metadata: { [key: string]: string } = {};
    if (session?.user?.id) {
      metadata.userId = session.user.id;
    }
    if (session?.user?.email) {
      metadata.userEmail = session.user.email;
    }

    // Создаем Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: 'Support this project',
              description: 'Thank you for supporting our project!',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata,
      success_url: `${appUrl}/support/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/support/cancel`,
      customer_email: session?.user?.email || undefined,
    });

    return NextResponse.json({ url: checkoutSession.url });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
