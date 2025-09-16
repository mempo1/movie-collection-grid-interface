import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  //  Проверка ключа Stripe
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      { error: 'Server misconfiguration: STRIPE_SECRET_KEY is not set' },
      { status: 500 }
    );
  }

  const stripe = new Stripe(secret, { apiVersion: '2023-10-16' });

  
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const amount = Number(body?.amount);
  const currency = String(body?.currency || 'usd').toLowerCase();

  if (!Number.isFinite(amount) || amount < 50) {
    return NextResponse.json(
      { error: 'Amount must be a number >= 50 cents' },
      { status: 400 }
    );
  }

  //  URL 
  const { origin } = new URL(req.url);
  
  const appUrl =
    process.env.APP_URL && process.env.APP_URL.startsWith('http')
      ? process.env.APP_URL
      : origin;

  
  const session = await getServerSession(authOptions).catch(() => null);
  const metadata: Record<string, string> = {};
  if (session?.user?.id) metadata.userId = String(session.user.id);
  if (session?.user?.email) metadata.userEmail = String(session.user.email);

  try {
    const checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
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

    return NextResponse.json({ url: checkout.url }, { status: 200 });
  } catch (err: any) {
    console.error('Stripe error creating session:', err);
    return NextResponse.json(
      { error: err?.message || 'Stripe error creating session' },
      { status: 400 }
    );
  }
}
