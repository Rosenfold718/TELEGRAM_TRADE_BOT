"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Trade } from "@/lib/types";
import { useApi } from "@/hooks/use-api";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/stores/app-store";
import { ArrowDownRight, ArrowUpRight, Clock, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function TradesTable() {
  const { tradesFilter, setTradesFilter } = useAppStore();
  const { data, loading, refetch } = useApi<{ trades: Trade[] }>(
    `/api/trades?status=${tradesFilter}&limit=100`,
    { intervalMs: 5000, deps: [tradesFilter] }
  );

  const trades = data?.trades || [];

  const formatUsd = (v: number | null | undefined) => {
    if (v === null || v === undefined) return "—";
    return `${v >= 0 ? "+" : ""}${v.toFixed(2)}`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-base font-semibold">Сделки</CardTitle>
          <Tabs value={tradesFilter} onValueChange={(v) => setTradesFilter(v as any)}>
            <TabsList className="grid grid-cols-3 w-full sm:w-auto">
              <TabsTrigger value="ALL">Все</TabsTrigger>
              <TabsTrigger value="OPEN">Открытые</TabsTrigger>
              <TabsTrigger value="CLOSED">Закрытые</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {loading && !data ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : trades.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            Нет сделок. Запусти worker, чтобы начать мониторинг сигналов.
          </div>
        ) : (
          <ScrollArea className="max-h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Symbol</TableHead>
                  <TableHead className="text-xs">Side</TableHead>
                  <TableHead className="text-xs text-right">Entry</TableHead>
                  <TableHead className="text-xs text-right">Exit</TableHead>
                  <TableHead className="text-xs text-right">P&L</TableHead>
                  <TableHead className="text-xs text-right">P&L %</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.map((t) => {
                  const pnl = t.pnlUsd ?? 0;
                  const pnlClass = pnl > 0 ? "text-emerald-600" : pnl < 0 ? "text-red-600" : "text-muted-foreground";
                  const pnlPct = t.pnlPct ?? 0;
                  return (
                    <TableRow key={t.id} className="text-xs">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1.5">
                          {t.symbol}
                          {t.isDemo && <Badge variant="outline" className="text-[10px] px-1">DEMO</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${t.side === "BUY" ? "text-emerald-600 border-emerald-600/30 bg-emerald-600/5" : "text-red-600 border-red-600/30 bg-red-600/5"}`}
                        >
                          {t.side === "BUY" ? <ArrowUpRight className="h-2.5 w-2.5 mr-0.5" /> : <ArrowDownRight className="h-2.5 w-2.5 mr-0.5" />}
                          {t.side}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{t.entryPrice.toFixed(4)}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {t.exitPrice !== null ? t.exitPrice.toFixed(4) : "—"}
                      </TableCell>
                      <TableCell className={`text-right tabular-nums font-semibold ${pnlClass}`}>
                        {t.status === "CLOSED" ? formatUsd(t.pnlUsd) : "—"}
                      </TableCell>
                      <TableCell className={`text-right tabular-nums ${pnlClass}`}>
                        {t.status === "CLOSED" ? `${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(2)}%` : "—"}
                      </TableCell>
                      <TableCell>
                        {t.status === "OPEN" ? (
                          <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-700 border-amber-600/20">
                            OPEN
                          </Badge>
                        ) : t.status === "CLOSED" ? (
                          <Badge variant="secondary" className="text-[10px]">
                            {t.closeReason === "TAKE_PROFIT" ? "TP" : t.closeReason === "STOP_LOSS" ? "SL" : t.closeReason || "CLOSED"}
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[10px]">
                            {t.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {formatDistanceToNow(new Date(t.openedAt), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
