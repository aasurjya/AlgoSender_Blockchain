import { NextRequest, NextResponse } from 'next/server';
import algosdk from 'algosdk';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { mnemonic } = body;

    if (!mnemonic) {
      return NextResponse.json(
        { success: false, message: 'Mnemonic is required' },
        { status: 400 }
      );
    }

    try {
      const account = algosdk.mnemonicToSecretKey(mnemonic);
      return NextResponse.json({
        success: true,
        data: {
          address: account.addr.toString(),
        },
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid mnemonic phrase' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Derive address error:', error.message);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to derive address',
      },
      { status: 500 }
    );
  }
}
