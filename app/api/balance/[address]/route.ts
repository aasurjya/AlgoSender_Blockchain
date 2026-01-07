import { NextRequest, NextResponse } from 'next/server';
import { getAccountBalance } from '@/lib/algorand';
import algosdk from 'algosdk';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!address || !algosdk.isValidAddress(address)) {
      return NextResponse.json(
        { success: false, message: 'Valid address is required' },
        { status: 400 }
      );
    }

    const balance = await getAccountBalance(address);

    return NextResponse.json({
      success: true,
      data: {
        address,
        balance,
      },
    });
  } catch (error: any) {
    console.error('Balance error:', error.message);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to fetch balance',
      },
      { status: 500 }
    );
  }
}
