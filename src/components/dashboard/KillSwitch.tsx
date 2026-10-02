"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useApi } from "@/hooks/use-api";
import { BinanceAccountResponse } from "@/lib/types";
import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Bomb, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

export function KillSwitch() {
  const { data, refetch } = useApi<BinanceAccountResponse>("/api/binance/account", { intervalMs: 30000 });
  const [closing, setClosing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleKill = async () => {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    setClosing(true);
    try {
      const res = await fetch("/api/worker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "killall" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success(`Закрыто позиций: ${json.closed}`);
      await refetch();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setClosing(false);
      setConfirming(false);
    }
  };

  const hasOpenPositions = (data?.summary?.openPositionsCount || 0) > 0;
  const demo = data?.demo;
  const isBanned = data?.connectivity?.error?.includes("banned") || data?.error?.includes("banned");
  const hasError = (data?.connectivity && !data.connectivity.ok && !demo) || data?.error;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Bomb className="h-4 w-4 text-red-600" />
          Kill Switch
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Binance connection:</span>
            {demo ? (
              <Badge variant="outline" className="text-amber-600 border-amber-600/30">DEMO</Badge>
            ) : hasError ? (
              <Badge variant="outline" className="text-red-600 border-red-600/30 flex items-center gap-1">
                <XCircle className="h-3 w-3" /> ERROR
              </Badge>
            ) : data?.connectivity?.ok ? (
              <Badge variant="outline" className="text-emerald-600 border-emerald-600/30 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> LIVE
              </Badge>
            ) : null}
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Open positions:</span>
            <span className="tabular-nums font-semibold">{data?.summary?.openPositionsCount || 0}</span>
          </div>
        </div>

        {hasError && !demo && (
          <Alert className="border-red-500/20 bg-red-500/5 py-2">
            <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
            <AlertTitle className="text-xs text-red-700">
              {isBanned ? "IP заблокирован" : "Binance недоступен"}
            </AlertTitle>
            <AlertDescription className="text-[11px] text-red-700/80">
              {isBanned
                ? "IP временно забанен Binance. На Vercel IP будет другой — там заработает."
                : data?.connectivity?.error || data?.error}
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleKill}
          disabled={closing || !hasOpenPositions}
          variant={confirming ? "destructive" : "outline"}
          size="sm"
          className="w-full"
        >
          {closing ? "Закрытие..." : confirming ? "Подтвердить закрытие всех" : "Закрыть все позиции"}
        </Button>

        {!hasOpenPositions && (
          <p className="text-xs text-muted-foreground text-center">
            Нет открытых позиций для закрытия
          </p>
        )}

        {demo && (
          <Alert className="border-amber-600/20 bg-amber-500/5">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-xs text-amber-700">DEMO режим</AlertTitle>
            <AlertDescription className="text-[11px] text-amber-700/80">
              API ключи Binance не настроены. Добавь BINANCE_API_KEY и BINANCE_API_SECRET в .env для реальной торговли.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
