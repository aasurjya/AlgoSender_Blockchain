import { NextResponse } from 'next/server';
import algosdk from 'algosdk';

export async function GET() {
  try {
    const account = algosdk.generateAccount();
    const mnemonic = algosdk.secretKeyToMnemonic(account.sk);

    return NextResponse.json({
      success: true,
      data: {
        mnemonic,
        address: account.addr,
      },
    });
  } catch (error: any) {
    console.error('Generate mnemonic error:', error.message);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to generate mnemonic',
      },
      { status: 500 }
    );
  }
}
