"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { Signal } from "@/lib/types";
import { useApi } from "@/hooks/use-api";
import { Radio, ExternalLink, Rocket } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function SignalsList() {
  const { data, loading } = useApi<{ signals: Signal[] }>(
    "/api/signals?onlySignals=true&limit=50",
    { intervalMs: 5000 }
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Radio className="h-4 w-4 text-amber-500" />
          Сигналы
          {data?.signals?.length ? (
            <Badge variant="secondary" className="text-xs">{data.signals.length}</Badge>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && !data ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !data?.signals || data.signals.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            Сигналов пока нет. Запусти worker, чтобы начать мониторинг Telegram-канала.
          </div>
        ) : (
          <ScrollArea className="max-h-96">
            <div className="space-y-2 pr-2">
              {data.signals.map((s) => (
                <div key={s.id} className="border rounded-md p-3 text-xs hover:bg-muted/40 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Rocket className="h-3.5 w-3.5 text-amber-500" />
                      <span className="font-semibold text-sm">{s.symbol}</span>
                      {s.priceAtSignal && (
                        <span className="text-muted-foreground tabular-nums">
                          @ {s.priceAtSignal.toFixed(s.priceAtSignal < 0.01 ? 6 : 2)}
                        </span>
                      )}
                    </div>
                    <a
                      href={`https://t.me/${s.channelName}/${s.telegramId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    {s.priceChangePct !== null && (
                      <Badge variant="outline" className="text-emerald-600 border-emerald-600/30">
                        Price +{s.priceChangePct.toFixed(1)}%
                      </Badge>
                    )}
                    {s.volumeChangePct !== null && (
                      <Badge variant="outline" className="text-amber-600 border-amber-600/30">
                        Vol +{s.volumeChangePct.toFixed(0)}%
                      </Badge>
                    )}
                    <span className="text-muted-foreground ml-auto">
                      {formatDistanceToNow(new Date(s.detectedAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
