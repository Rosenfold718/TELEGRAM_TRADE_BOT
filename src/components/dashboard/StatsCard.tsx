"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Award, Target } from "lucide-react";
import type { Stats } from "@/lib/types";
import { useApi } from "@/hooks/use-api";
import { Skeleton } from "@/components/ui/skeleton";

interface StatItemProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  valueClass?: string;
}

function StatItem({ label, value, icon, valueClass }: StatItemProps) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground flex items-center gap-1.5">
        {icon}
        {label}
      </div>
      <div className={`text-lg font-semibold tabular-nums ${valueClass || ""}`}>{value}</div>
    </div>
  );
}

export function StatsCard() {
  const { data, loading } = useApi<Stats>("/api/trades/stats", { intervalMs: 10000 });

  if (loading && !data) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { wins, losses, winRate, totalPnl, totalTrades, avgPnl } = data;
  const pnlClass = totalPnl >= 0 ? "text-emerald-600" : "text-red-600";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Статистика сделок</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatItem
          label="Win Rate"
          value={`${winRate.toFixed(1)}%`}
          icon={<Award className="h-3.5 w-3.5" />}
          valueClass={winRate >= 50 ? "text-emerald-600" : "text-amber-600"}
        />
        <StatItem
          label="Total P&L"
          value={`${totalPnl >= 0 ? "+" : ""}${totalPnl.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`}
          icon={totalPnl >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          valueClass={pnlClass}
        />
        <StatItem
          label="Всего сделок"
          value={`${totalTrades}`}
          icon={<Target className="h-3.5 w-3.5" />}
        />
        <StatItem
          label="Побед / Убытков"
          value={`${wins} / ${losses}`}
          icon={<Award className="h-3.5 w-3.5" />}
          valueClass="text-muted-foreground"
        />
        <StatItem
          label="Средний P&L"
          value={`${avgPnl >= 0 ? "+" : ""}${avgPnl.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={avgPnl >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          valueClass={avgPnl >= 0 ? "text-emerald-600" : "text-red-600"}
        />
        <StatItem
          label="Win/Loss"
          value={`${losses > 0 ? (wins / losses).toFixed(2) : "—"}`}
          icon={<Target className="h-3.5 w-3.5" />}
        />
      </CardContent>
    </Card>
  );
}
