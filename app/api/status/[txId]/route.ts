import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, Transaction } from '@/lib/mongodb';
import { checkTransactionStatus } from '@/lib/algorand';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ txId: string }> }
) {
  try {
    const { txId } = await params;

    if (!txId) {
      return NextResponse.json(
        { success: false, message: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // Check transaction status
    const status = await checkTransactionStatus(txId);

    // Connect to database and update status if changed
    try {
      await connectToDatabase();
      const dbTransaction = await Transaction.findOne({ txId });

      if (dbTransaction && dbTransaction.status !== status.status) {
        await Transaction.findOneAndUpdate(
          { txId },
          {
            status: status.status,
            confirmedRound: status.confirmedRound,
          }
        );
      }
    } catch (dbError: any) {
      console.error('Database error:', dbError.message);
    }

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    console.error('Status check error:', error.message);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to check transaction status',
      },
      { status: 500 }
    );
  }
}
