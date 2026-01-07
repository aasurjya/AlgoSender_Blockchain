import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'AlgoSender server is running',
    network: 'Algorand TestNet',
    timestamp: new Date().toISOString(),
  });
}
