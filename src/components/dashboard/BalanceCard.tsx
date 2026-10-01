"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from "lucide-react";
import type { BinanceAccountResponse } from "@/lib/types";
import { useApi } from "@/hooks/use-api";
import { Skeleton } from "@/components/ui/skeleton";

export function BalanceCard() {
  const { data, loading, error } = useApi<BinanceAccountResponse>("/api/binance/account", {
    intervalMs: 5000,
  });

  if (loading && !data) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
          <Skeleton className="mt-2 h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            Ошибка получения баланса
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const { summary, demo, testnet, positions } = data;
  const usdtWallet = summary.usdtWallet;
  const usdtAvailable = summary.usdtAvailable;
  const unrealizedPnl = summary.unrealizedPnl;
  const hasPnl = Math.abs(unrealizedPnl) > 0.01;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
            <Wallet className="h-4 w-4" />
            USDT Balance
          </CardTitle>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {demo && <Badge variant="outline" className="text-xs">DEMO</Badge>}
          {testnet && <Badge variant="secondary" className="text-xs">TESTNET</Badge>}
          {!demo && !testnet && (
            <Badge variant="default" className="text-xs bg-emerald-600 hover:bg-emerald-600">
              <CheckCircle2 className="h-3 w-3 mr-1" /> LIVE
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-2xl font-bold tracking-tight">
            {usdtWallet.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Доступно: {usdtAvailable.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Нереализованный P&L</p>
            <p className={`text-sm font-semibold flex items-center gap-1 ${hasPnl ? (unrealizedPnl >= 0 ? "text-emerald-600" : "text-red-600") : "text-muted-foreground"}`}>
              {unrealizedPnl >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {unrealizedPnl >= 0 ? "+" : ""}
              {unrealizedPnl.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Открытых позиций</p>
            <p className="text-sm font-semibold">{summary.openPositionsCount}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
