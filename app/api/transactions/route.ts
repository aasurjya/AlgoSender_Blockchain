import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, Transaction } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = Number(searchParams.get('limit')) || 50;
    const skip = Number(searchParams.get('skip')) || 0;

    // Build query filter
    const queryFilter: any = {};
    if (status) {
      queryFilter.status = status;
    }

    // Fetch transactions
    const transactions = await Transaction.find(queryFilter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Transaction.countDocuments(queryFilter);

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        total,
        limit,
        skip,
      },
    });
  } catch (error: any) {
    console.error('Transactions error:', error.message);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to fetch transactions',
      },
      { status: 500 }
    );
  }
}
