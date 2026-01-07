import { NextResponse } from 'next/server';
import { connectToDatabase, Transaction } from '@/lib/mongodb';

export async function GET() {
  try {
    await connectToDatabase();

    const total = await Transaction.countDocuments();
    const confirmed = await Transaction.countDocuments({ status: 'confirmed' });
    const pending = await Transaction.countDocuments({ status: 'pending' });
    const failed = await Transaction.countDocuments({ status: 'failed' });

    const totalAlgoSent = await Transaction.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const successRate = total > 0 ? ((confirmed / total) * 100).toFixed(2) : '0';

    return NextResponse.json({
      success: true,
      data: {
        total,
        confirmed,
        pending,
        failed,
        totalAlgoSent: totalAlgoSent[0]?.total || 0,
        successRate: `${successRate}%`,
      },
    });
  } catch (error: any) {
    console.error('Stats error:', error.message);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to fetch stats',
      },
      { status: 500 }
    );
  }
}
