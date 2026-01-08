import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, Transaction } from '@/lib/mongodb';
import { checkTransactionStatus } from '@/lib/algorand';

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

    // Update pending transactions in background (don't await all)
    const pendingTxs = transactions.filter((tx: any) => tx.status === 'pending');
    if (pendingTxs.length > 0) {
      console.log(`Found ${pendingTxs.length} pending transactions to check`);
      // Update up to 5 pending transactions
      const toUpdate = pendingTxs.slice(0, 5);
      await Promise.all(
        toUpdate.map(async (tx: any) => {
          try {
            const statusResult = await checkTransactionStatus(tx.txId);
            console.log(`Transaction ${tx.txId} status: ${statusResult.status}`);
            if (statusResult.status !== 'pending') {
              await Transaction.findOneAndUpdate(
                { txId: tx.txId },
                { status: statusResult.status, confirmedRound: statusResult.confirmedRound }
              );
              // Update the transaction object for response
              tx.status = statusResult.status;
              tx.confirmedRound = statusResult.confirmedRound;
            }
          } catch (e) {
            console.log(`Error checking transaction ${tx.txId}:`, e);
          }
        })
      );
    }

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
