"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { AppLog } from "@/lib/types";
import { useApi } from "@/hooks/use-api";
import { Info, AlertTriangle, AlertCircle, Bug } from "lucide-react";

const ICONS: Record<string, React.ReactNode> = {
  INFO: <Info className="h-3 w-3 text-blue-500" />,
  WARN: <AlertTriangle className="h-3 w-3 text-amber-500" />,
  ERROR: <AlertCircle className="h-3 w-3 text-red-500" />,
  DEBUG: <Bug className="h-3 w-3 text-muted-foreground" />,
};

const LEVELS: Record<string, string> = {
  INFO: "text-blue-600",
  WARN: "text-amber-600",
  ERROR: "text-red-600",
  DEBUG: "text-muted-foreground",
};

export function LogsPanel() {
  const { data, loading } = useApi<{ logs: AppLog[] }>("/api/logs?limit=100", { intervalMs: 5000 });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Логи
          {data?.logs?.length ? (
            <Badge variant="secondary" className="text-xs">{data.logs.length}</Badge>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && !data ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : !data?.logs || data.logs.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            Логов пока нет
          </div>
        ) : (
          <ScrollArea className="max-h-72">
            <div className="space-y-1 pr-2">
              {data.logs.map((l) => (
                <div key={l.id} className="text-xs font-mono flex items-start gap-2 hover:bg-muted/40 px-2 py-1 rounded">
                  <span className="text-muted-foreground shrink-0 tabular-nums">
                    {new Date(l.createdAt).toLocaleTimeString()}
                  </span>
                  <span className="shrink-0">{ICONS[l.level] || <Info className="h-3 w-3" />}</span>
                  <span className="text-muted-foreground shrink-0">[{l.category}]</span>
                  <span className={`${LEVELS[l.level] || ""} line-clamp-2`}>{l.message}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
