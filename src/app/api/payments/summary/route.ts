import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Payment from '@/models/Payment';

export async function GET() {
  try {
    await dbConnect();

    // Получаем сумму всех успешных платежей
    const result = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded'
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalCount: { $sum: 1 }
        }
      }
    ]);

    const summary = result[0] || { totalAmount: 0, totalCount: 0 };

    return NextResponse.json({
      totalAmount: summary.totalAmount, // в центах
      totalAmountFormatted: (summary.totalAmount / 100).toFixed(2), // в долларах
      totalCount: summary.totalCount,
      currency: 'USD'
    });

  } catch (error) {
    console.error('Error fetching payment summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment summary' },
      { status: 500 }
    );
  }
}
