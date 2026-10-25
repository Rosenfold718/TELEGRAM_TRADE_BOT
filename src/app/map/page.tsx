"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Home,
  ExternalLink,
  Boxes,
  Network,
  ListChecks,
  Server,
  Activity,
  Cpu,
} from "lucide-react";
import Link from "next/link";
import { useApi } from "@/hooks/use-api";
import { toast } from "sonner";
import { InteractiveGraph } from "@/components/dashboard/InteractiveGraph";

// ===== Типы =====
interface HealthResponse {
  timestamp: string;
  components: {
    binance?: ComponentInfo;
    telegram?: ComponentInfo;
    database?: ComponentInfo;
    worker?: ComponentInfo;
    trading?: ComponentInfo;
    [key: string]: any;
  };
  checklist: ChecklistItem[];
}

interface ComponentInfo {
  label: string;
  status: "ok" | "warning" | "banned" | "error";
  statusLabel: string;
  [key: string]: any;
}

interface ChecklistItem {
  id: string;
  label: string;
  status: "done" | "pending" | "warning";
  description: string;
  action?: string;
}

// ===== Утилиты =====
const statusBg = (status: string) => {
  switch (status) {
    case "ok":
    case "done":
      return "bg-emerald-500/10 border-emerald-600/30";
    case "warning":
    case "pending":
      return "bg-amber-500/10 border-amber-600/30";
    case "banned":
    case "error":
      return "bg-red-500/10 border-red-600/30";
    default:
      return "bg-slate-700/30 border-slate-600/30";
  }
};

const statusIcon = (status: string) => {
  switch (status) {
    case "ok":
    case "done":
      return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    case "warning":
    case "pending":
      return <AlertTriangle className="h-4 w-4 text-amber-400" />;
    case "banned":
    case "error":
      return <XCircle className="h-4 w-4 text-red-400" />;
    default:
      return null;
  }
};

// ===== Главный компонент =====
export default function MapPage() {
  const { data, loading, error, refetch } = useApi<HealthResponse>("/api/health", { intervalMs: 15000 });
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      toast.success("Статус обновлён");
    } finally {
      setRefreshing(false);
    }
  };

  const checklistDone = data?.checklist?.filter((c) => c.status === "done").length || 0;
  const checklistTotal = data?.checklist?.length || 0;
  const checklistPct = checklistTotal > 0 ? (checklistDone / checklistTotal) * 100 : 0;

  return (
    <div
      className="min-h-screen text-slate-100"
      style={{
        background: `
          radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 100% 100%, rgba(16, 185, 129, 0.06) 0%, transparent 50%),
          #0f172a
        `,
      }}
    >
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500 blur-md opacity-30 rounded-full" />
              <Network className="relative h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-100">
                Карта проекта
              </h1>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Интерактивная архитектура · Live статус компонентов
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
              Обновить
            </Button>
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <Home className="h-3.5 w-3.5 mr-1.5" />
                Дашборд
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-6 space-y-4">
        {/* Overview metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="bg-slate-900/70 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-xs text-slate-400">Готовность проекта</div>
              <div className="text-2xl font-bold mt-1 tabular-nums text-cyan-400">
                {checklistPct.toFixed(0)}%
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {checklistDone} из {checklistTotal}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-xs text-slate-400">Компонентов</div>
              <div className="text-2xl font-bold mt-1 tabular-nums text-violet-400">
                {Object.keys(data?.components || {}).length}
              </div>
              <div className="text-xs text-slate-400 mt-1">подсистем</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-xs text-slate-400">БД: записей</div>
              <div className="text-2xl font-bold mt-1 tabular-nums text-emerald-400">
                {data?.components.database?.counts
                  ? data.components.database.counts.trades +
                    data.components.database.counts.signals +
                    data.components.database.counts.logs
                  : "—"}
              </div>
              <div className="text-xs text-slate-400 mt-1">trades + signals + logs</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-xs text-slate-400">Последняя проверка</div>
              <div className="text-sm font-semibold mt-1 tabular-nums text-slate-100">
                {data ? new Date(data.timestamp).toLocaleTimeString() : "—"}
              </div>
              <div className="text-xs text-slate-400 mt-1">обновляется каждые 15 сек</div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <Alert className="border-red-500/20 bg-red-500/5">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertTitle className="text-sm text-red-300">Ошибка получения статуса</AlertTitle>
            <AlertDescription className="text-xs text-red-300/80">{error}</AlertDescription>
          </Alert>
        )}

        {/* Interactive graph */}
        <InteractiveGraph />

        {/* Component cards */}
        <Card className="bg-slate-900/70 border-slate-700 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Server className="h-4 w-4 text-cyan-400" />
              <h3 className="text-base font-semibold text-slate-100">Компоненты системы</h3>
            </div>
            {loading && !data ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full bg-slate-800" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(data?.components || {}).map(([key, comp]: [string, any]) => (
                  <div
                    key={key}
                    className={`border rounded-lg p-3 ${statusBg(comp.status)}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className="text-sm font-semibold capitalize text-slate-100 flex items-center gap-1.5">
                        {statusIcon(comp.status)}
                        {key === "binance"
                          ? "Binance API"
                          : key === "telegram"
                          ? "Telegram"
                          : key === "database"
                          ? "Database"
                          : key === "worker"
                          ? "Worker"
                          : "Trading"}
                      </h4>
                      <Badge
                        variant="outline"
                        className="text-[10px]"
                        style={{
                          color:
                            comp.status === "ok"
                              ? "#34d399"
                              : comp.status === "warning"
                              ? "#fbbf24"
                              : "#f87171",
                          borderColor:
                            comp.status === "ok"
                              ? "rgba(52, 211, 153, 0.4)"
                              : comp.status === "warning"
                              ? "rgba(251, 191, 36, 0.4)"
                              : "rgba(248, 113, 113, 0.4)",
                        }}
                      >
                        {comp.status === "ok"
                          ? "OK"
                          : comp.status === "warning"
                          ? "WAIT"
                          : comp.status === "banned"
                          ? "BAN"
                          : "ERR"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{comp.statusLabel}</p>

                    {/* Дополнительные детали */}
                    {key === "binance" && comp.configured && (
                      <div className="space-y-0.5 text-[11px] text-slate-400">
                        <div>
                          Mode: <span className="font-mono text-slate-300">{comp.mode}</span>
                        </div>
                        {comp.latencyMs !== undefined && (
                          <div>
                            Latency: <span className="tabular-nums text-slate-300">{comp.latencyMs}ms</span>
                          </div>
                        )}
                      </div>
                    )}
                    {key === "telegram" && (
                      <div className="space-y-0.5 text-[11px] text-slate-400">
                        <div>
                          Method: <span className="font-mono text-slate-300">{comp.method}</span>
                        </div>
                        {comp.me?.username && (
                          <div>
                            User: <span className="font-mono text-slate-300">@{comp.me.username}</span>
                          </div>
                        )}
                      </div>
                    )}
                    {key === "database" && comp.connected && (
                      <div className="space-y-0.5 text-[11px] text-slate-400">
                        <div>
                          Type: <span className="font-mono text-slate-300">{comp.type}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 mt-1">
                          <div>
                            Trades: <span className="tabular-nums text-slate-300">{comp.counts.trades}</span>
                          </div>
                          <div>
                            Signals: <span className="tabular-nums text-slate-300">{comp.counts.signals}</span>
                          </div>
                          <div>
                            Settings: <span className="tabular-nums text-slate-300">{comp.counts.settings}</span>
                          </div>
                          <div>
                            Logs: <span className="tabular-nums text-slate-300">{comp.counts.logs}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {key === "worker" && (
                      <div className="space-y-0.5 text-[11px] text-slate-400">
                        <div>
                          Poll: <span className="font-mono text-slate-300">{comp.pollIntervalSec}s</span>
                        </div>
                        <div>
                          Check: <span className="font-mono text-slate-300">{comp.checkIntervalSec}s</span>
                        </div>
                      </div>
                    )}
                    {key === "trading" && (
                      <div className="space-y-0.5 text-[11px] text-slate-400">
                        <div>
                          Leverage: <span className="font-mono text-slate-300">{comp.leverage}x</span>
                        </div>
                        <div>
                          Position: <span className="font-mono text-slate-300">{comp.positionSizePct}%</span>
                        </div>
                        <div>
                          TP/SL:{" "}
                          <span className="font-mono text-slate-300">
                            +{comp.takeProfitPct}% / -{comp.stopLossPct}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Checklist */}
        <Card className="bg-slate-900/70 border-slate-700 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <ListChecks className="h-4 w-4 text-cyan-400" />
              <h3 className="text-base font-semibold text-slate-100">Чек-лист готовности</h3>
              <Badge
                variant="secondary"
                className="text-xs ml-auto bg-slate-800 text-slate-300 border border-slate-700"
              >
                {checklistDone} / {checklistTotal}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Что нужно для полноценной работы торгового бота
            </p>
            {loading && !data ? (
              <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full bg-slate-800" />
                ))}
              </div>
            ) : (
              <div className="space-y-1.5">
                {data?.checklist?.map((item) => (
                  <div
                    key={item.id}
                    className={`border rounded-md p-2.5 flex items-start gap-2.5 ${statusBg(item.status)}`}
                  >
                    <div className="mt-0.5">{statusIcon(item.status)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h4 className="text-sm font-medium text-slate-100">{item.label}</h4>
                        {item.action && (
                          <a
                            href={item.action}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-slate-400 hover:text-cyan-400 inline-flex items-center gap-0.5 underline underline-offset-2"
                          >
                            открыть <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-8">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-3 text-center text-xs text-slate-500">
          Карта проекта ·{" "}
          <Link href="/" className="hover:text-cyan-400 underline underline-offset-2">
            вернуться к дашборду
          </Link>
        </div>
      </footer>
    </div>
  );
}
