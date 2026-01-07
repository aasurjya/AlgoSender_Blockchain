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

    // Wait for transaction confirmation (up to 10 seconds)
    let finalStatus = 'pending';
    let confirmedRound = null;
    
    for (let i = 0; i < 5; i++) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      try {
        const statusResult = await checkTransactionStatus(result.txId);
        if (statusResult.status === 'confirmed') {
          finalStatus = 'confirmed';
          confirmedRound = statusResult.confirmedRound;
          break;
        } else if (statusResult.status === 'failed') {
          finalStatus = 'failed';
          break;
        }
      } catch (e) {
        // Continue waiting
      }
    }

    // Save to DB with final status
    try {
      const transaction = new Transaction({
        txId: result.txId,
        from: result.from,
        to: result.to,
        amount: result.amount,
        note: result.note,
        status: finalStatus,
        confirmedRound: confirmedRound,
      });

      await transaction.save();
    } catch (dbError: any) {
      console.error('Failed to save transaction:', dbError.message);
    }

    return NextResponse.json({
      success: true,
      data: {
        txId: result.txId,
        from: result.from,
        to: result.to,
        amount: result.amount,
        note: result.note,
        status: finalStatus,
        confirmedRound: confirmedRound,
      },
      message: finalStatus === 'confirmed' ? 'Transaction confirmed!' : 'Transaction sent',
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
