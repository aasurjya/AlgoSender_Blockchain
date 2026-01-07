import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, Transaction } from '@/lib/mongodb';
import { sendTransaction, checkTransactionStatus } from '@/lib/algorand';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { mnemonic, recipientAddress, amount, note } = body;

    // Validate required fields
    if (!mnemonic || !recipientAddress || !amount) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send transaction
    const result = await sendTransaction({
      mnemonic,
      recipientAddress,
      amount,
      note,
    });

    // Connect to database
    await connectToDatabase();

    // Save to DB
    try {
      const transaction = new Transaction({
        txId: result.txId,
        from: result.from,
        to: result.to,
        amount: result.amount,
        note: result.note,
        status: 'pending',
      });

      await transaction.save();
    } catch (dbError: any) {
      console.error('Failed to save transaction:', dbError.message);
    }

    // Update status asynchronously
    updateTransactionStatus(result.txId);

    return NextResponse.json({
      success: true,
      data: {
        txId: result.txId,
        from: result.from,
        to: result.to,
        amount: result.amount,
        note: result.note,
      },
      message: 'Transaction sent successfully',
    });
  } catch (error: any) {
    console.error('Send transaction error:', error.message);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to send transaction',
      },
      { status: 500 }
    );
  }
}

// Helper function to update transaction status asynchronously
async function updateTransactionStatus(txId: string) {
  try {
    // Wait a bit for transaction to be processed
    await new Promise((resolve) => setTimeout(resolve, 5000));
    
    const status = await checkTransactionStatus(txId);
    
    await connectToDatabase();
    await Transaction.findOneAndUpdate(
      { txId },
      {
        status: status.status,
        confirmedRound: status.confirmedRound,
      }
    );
  } catch (error: any) {
    console.error('Error updating transaction status:', error.message);
  }
}
