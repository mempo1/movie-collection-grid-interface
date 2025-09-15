import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Stripe from 'stripe';

export const runtime = 'nodejs';         
export const dynamic = 'force-dynamic';    

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'usd' } = await request.json();

    // валидация суммы
    if (!amount || typeof amount !== 'number' || amount < 50) {
      return NextResponse.json(
        { error: 'Amount must be at least 50 cents' },
        { status: 400 }
      );
    }

    // читаем ключ из переменных окружения
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      console.error('ENV ERROR: STRIPE_SECRET_KEY is not set');
      return NextResponse.json(
        { error: 'Server misconfiguration: STRIPE_SECRET_KEY is not set' },
        { status: 500 }
      );
    }

    // инициализируем Stripe уже после проверки
    const stripe = new Stripe(secret, { apiVersion: '2024-06-20' });

    // сессия пользователя
    const session = await getServerSession(authOptions);

    //  URL для редиректов
    const appUrl =
      process.env.APP_URL ||
      process.env.NEXTAUTH_URL ||
      'http://localhost:3000';

    // метаданные для webhooks/панели Stripe
    const metadata: Record<string, string> = {};
    if (session?.user?.id) metadata.userId = String(session.user.id);
    if (session?.user?.email) metadata.userEmail = String(session.user.email);

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
            unit_amount: amount, // центы
          },
          quantity: 1,
        },
      ],
      metadata,
      success_url: `${appUrl}/support/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/support/cancel`,
      customer_email: session?.user?.email ?? undefined,
    });

    return NextResponse.json({ url: checkoutSession.url }, { status: 200 });
  } catch (err: any) {
    console.error('Error creating checkout session:', err);
    const message = err?.raw?.message || err?.message || 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
