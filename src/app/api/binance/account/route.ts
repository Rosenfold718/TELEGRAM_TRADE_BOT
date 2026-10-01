import { NextResponse } from "next/server";
import { getAccountBalance, getPositions, testConnectivity, isBinanceConfigured } from "@/lib/binance";

export async function GET() {
  try {
    const [balance, positions, connectivity] = await Promise.all([
      getAccountBalance(),
      getPositions(),
      testConnectivity(),
    ]);

    const usdt = balance.find((b) => b.asset === "USDT");
    const unrealizedPnl = positions.reduce((acc, p) => acc + p.unRealizedProfit, 0);

    return NextResponse.json({
      configured: isBinanceConfigured(),
      demo: !isBinanceConfigured(),
      testnet: connectivity.testnet,
      connectivity,
      balance,
      positions,
      summary: {
        usdtWallet: usdt?.walletBalance || 0,
        usdtAvailable: usdt?.availableBalance || 0,
        usdtMargin: usdt?.marginBalance || 0,
        unrealizedPnl,
        openPositionsCount: positions.length,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, configured: isBinanceConfigured() }, { status: 500 });
  }
}
