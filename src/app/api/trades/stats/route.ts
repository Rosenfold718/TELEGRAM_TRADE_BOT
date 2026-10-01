import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const trades = await db.trade.findMany({
      where: { status: "CLOSED" },
      orderBy: { closedAt: "desc" },
    });

    const total = trades.length;
    const wins = trades.filter((t) => (t.pnlUsd || 0) > 0).length;
    const losses = trades.filter((t) => (t.pnlUsd || 0) < 0).length;
    const winRate = total > 0 ? (wins / total) * 100 : 0;

    const totalPnl = trades.reduce((acc, t) => acc + (t.pnlUsd || 0), 0);
    const avgPnl = total > 0 ? totalPnl / total : 0;
    const bestTrade = trades.reduce(
      (best, t) => ((t.pnlUsd || 0) > (best?.pnlUsd || -Infinity) ? t : best),
      null as any
    );
    const worstTrade = trades.reduce(
      (worst, t) => ((t.pnlUsd || 0) < (worst?.pnlUsd || Infinity) ? t : worst),
      null as any
    );

    // P&L по дням (последние 30 дней)
    const dailyMap = new Map<string, number>();
    for (const t of trades) {
      if (!t.closedAt) continue;
      const day = t.closedAt.toISOString().slice(0, 10);
      dailyMap.set(day, (dailyMap.get(day) || 0) + (t.pnlUsd || 0));
    }
    const dailyPnl = Array.from(dailyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-30)
      .map(([day, pnl]) => ({ day, pnl: Number(pnl.toFixed(2)) }));

    // Кумулятивный P&L
    let cum = 0;
    const cumulativePnl = dailyPnl.map((d) => {
      cum += d.pnl;
      return { day: d.day, cumulative: Number(cum.toFixed(2)) };
    });

    // Win/Loss distribution
    const winLossDist = {
      wins,
      losses,
      winRate: Number(winRate.toFixed(2)),
    };

    // Win/Loss по символу
    const symbolMap = new Map<string, { count: number; pnl: number; wins: number }>();
    for (const t of trades) {
      const s = symbolMap.get(t.symbol) || { count: 0, pnl: 0, wins: 0 };
      s.count++;
      s.pnl += t.pnlUsd || 0;
      if ((t.pnlUsd || 0) > 0) s.wins++;
      symbolMap.set(t.symbol, s);
    }
    const bySymbol = Array.from(symbolMap.entries())
      .map(([symbol, v]) => ({
        symbol,
        count: v.count,
        pnl: Number(v.pnl.toFixed(2)),
        winRate: v.count > 0 ? Number(((v.wins / v.count) * 100).toFixed(2)) : 0,
      }))
      .sort((a, b) => b.pnl - a.pnl);

    return NextResponse.json({
      totalTrades: total,
      wins,
      losses,
      winRate: Number(winRate.toFixed(2)),
      totalPnl: Number(totalPnl.toFixed(2)),
      avgPnl: Number(avgPnl.toFixed(2)),
      bestTrade: bestTrade
        ? { symbol: bestTrade.symbol, pnlUsd: Number((bestTrade.pnlUsd || 0).toFixed(2)), pnlPct: Number((bestTrade.pnlPct || 0).toFixed(2)) }
        : null,
      worstTrade: worstTrade
        ? { symbol: worstTrade.symbol, pnlUsd: Number((worstTrade.pnlUsd || 0).toFixed(2)), pnlPct: Number((worstTrade.pnlPct || 0).toFixed(2)) }
        : null,
      dailyPnl,
      cumulativePnl,
      winLossDist,
      bySymbol,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
