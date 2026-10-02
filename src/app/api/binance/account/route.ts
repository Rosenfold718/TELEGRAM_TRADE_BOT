import { NextResponse } from "next/server";
import { getAccountBalance, getPositions, testConnectivity, isBinanceConfigured } from "@/lib/binance";

export async function GET() {
  try {
    const configured = isBinanceConfigured();
    const connectivity = await testConnectivity();

    if (!connectivity.ok) {
      return NextResponse.json({
        configured,
        demo: !configured,
        testnet: connectivity.testnet,
        connectivity,
        balance: [],
        positions: [],
        summary: {
          usdtWallet: 0,
          usdtAvailable: 0,
          usdtMargin: 0,
          unrealizedPnl: 0,
          openPositionsCount: 0,
        },
        error: connectivity.error,
      });
    }

    const [balance, positions] = await Promise.all([
      getAccountBalance(),
      getPositions(),
    ]);

    const usdt = balance.find((b) => b.asset === "USDT");
    const unrealizedPnl = positions.reduce((acc, p) => acc + p.unRealizedProfit, 0);

    return NextResponse.json({
      configured,
      demo: !configured,
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
    console.error("[api/binance/account] error:", e);
    return NextResponse.json(
      {
        configured: isBinanceConfigured(),
        demo: !isBinanceConfigured(),
        error: e.message,
        balance: [],
        positions: [],
        summary: {
          usdtWallet: 0,
          usdtAvailable: 0,
          usdtMargin: 0,
          unrealizedPnl: 0,
          openPositionsCount: 0,
        },
      },
      { status: 500 }
    );
  }
}
