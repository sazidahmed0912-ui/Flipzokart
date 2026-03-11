import { NextResponse } from 'next/server';

export async function GET() {
  // In the future this will be replaced with real analytics logic
  return NextResponse.json({
    activeUsers: 2400,
    dailyShipments: 500000,
    verifiedBrands: 10000,
    satisfactionRate: 99.9
  });
}
