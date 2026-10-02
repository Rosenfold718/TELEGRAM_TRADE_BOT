"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Wallet, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, RefreshCw, Clock } from "lucide-react";
import type { BinanceAccountResponse } from "@/lib/types";
import { useApi } from "@/hooks/use-api";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

export function BalanceCard() {
  const { data, loading, error, refetch } = useApi<BinanceAccountResponse>("/api/binance/account", {
    intervalMs: 30000,
  });
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

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

  const { summary, demo, testnet, balance, connectivity } = data;
  const isBanned = connectivity?.error?.includes("banned") || data.error?.includes("banned");
  const hasError = (connectivity && !connectivity.ok && !demo) || data.error;

  // Если есть ошибка подключения — показываем её с понятным описанием
  if (hasError && !demo) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
            <Wallet className="h-4 w-4" />
            Binance Balance
          </CardTitle>
          <Badge variant="outline" className="text-xs text-red-600 border-red-600/30">
            <AlertCircle className="h-3 w-3 mr-1" /> ERROR
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert className="border-red-500/20 bg-red-500/5">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-sm text-red-700">
              {isBanned ? "IP заблокирован Binance" : "Ошибка подключения"}
            </AlertTitle>
            <AlertDescription className="text-xs text-red-700/80 space-y-2">
              <p>
                {isBanned
                  ? "Binance временно забанил IP сервера из-за превышения лимита запросов. Бан длится обычно 2-24 часа, после чего автоматически снимется."
                  : connectivity?.error || data.error}
              </p>
              {isBanned && (
                <p className="text-[11px]">
                  💡 На Vercel (production) IP другой, и блокировки там не будет.
                  Также мы добавили кэширование запросов (15 сек для баланса, 5 сек для цен),
                  чтобы избежать повторного бана.
                </p>
              )}
            </AlertDescription>
          </Alert>
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm" className="w-full">
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Проверка..." : "Повторить подключение"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const usdtWallet = summary.usdtWallet;
  const usdtAvailable = summary.usdtAvailable;
  const unrealizedPnl = summary.unrealizedPnl;
  const hasPnl = Math.abs(unrealizedPnl) > 0.01;

  const otherAssets = (balance || []).filter((b) => b.asset !== "USDT" && b.walletBalance > 0.0001);

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
          {testnet && !demo && (
            <Badge variant="secondary" className="text-xs">TESTNET</Badge>
          )}
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

        {otherAssets.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Доп. активы</p>
            <div className="flex flex-wrap gap-1.5">
              {otherAssets.slice(0, 4).map((a) => (
                <Badge key={a.asset} variant="outline" className="text-[10px] tabular-nums">
                  {a.asset}: {a.walletBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </Badge>
              ))}
              {otherAssets.length > 4 && (
                <Badge variant="outline" className="text-[10px]">
                  +{otherAssets.length - 4} ещё
                </Badge>
              )}
            </div>
          </div>
        )}

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

        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t">
          <span className="flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            Обновление: 30 сек
          </span>
          <button onClick={handleRefresh} disabled={refreshing} className="hover:text-foreground transition-colors">
            <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
