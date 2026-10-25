"use client";

import { useEffect, useRef, useState } from "react";
import meridian from "mermaid";
import { useApi } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw, Home, FileJson, ExternalLink, Boxes, Network, ListChecks } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// ===== Типы =====
interface HealthResponse {
  timestamp: string;
  components: {
    binance?: {
      label: string;
      configured: boolean;
      mode: string;
      connected: boolean;
      latencyMs?: number;
      error?: string;
      status: "ok" | "warning" | "banned" | "error";
      statusLabel: string;
    };
    telegram?: {
      label: string;
      configured: boolean;
      method: string;
      connected: boolean;
      me?: { firstName: string; username?: string } | null;
      error?: string;
      status: "ok" | "warning" | "error";
      statusLabel: string;
    };
    database?: {
      label: string;
      type: string;
      url: string;
      connected: boolean;
      error?: string;
      counts: { trades: number; signals: number; settings: number; logs: number };
      status: "ok" | "error";
      statusLabel: string;
    };
    worker?: {
      label: string;
      pollIntervalSec: number;
      checkIntervalSec: number;
      status: "ok";
      statusLabel: string;
    };
    trading?: {
      label: string;
      enabled: boolean;
      leverage: number;
      positionSizePct: number;
      takeProfitPct: number;
      stopLossPct: number;
      status: "ok" | "warning";
      statusLabel: string;
    };
  };
  checklist: {
    id: string;
    label: string;
    status: "done" | "pending" | "warning";
    description: string;
    action?: string;
  }[];
}

// ===== Утилиты =====
const statusColor = (status: string) => {
  switch (status) {
    case "ok":
    case "done":
      return "#10b981"; // emerald-500
    case "warning":
    case "pending":
      return "#f59e0b"; // amber-500
    case "banned":
      return "#ef4444"; // red-500
    case "error":
      return "#ef4444";
    default:
      return "#94a3b8"; // slate-400
  }
};

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
      return "bg-muted border-border";
  }
};

const statusIcon = (status: string) => {
  switch (status) {
    case "ok":
    case "done":
      return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    case "warning":
    case "pending":
      return <AlertTriangle className="h-4 w-4 text-amber-600" />;
    case "banned":
    case "error":
      return <XCircle className="h-4 w-4 text-red-600" />;
    default:
      return null;
  }
};

// ===== Генерация Mermaid mind map =====
function generateMermaid(data: HealthResponse): string {
  const c = data.components;
  const lines: string[] = ["mindmap"];

  // Корень — проект
  lines.push("  root((Crypto Signals\nTrader))");

  // Binance
  lines.push("    Binance Futures");
  const binanceStatus = c.binance?.status || "warning";
  lines.push(`      Binance:::${binanceStatus === "ok" ? "okn" : binanceStatus === "banned" ? "bannedn" : "warnn"}`);
  if (c.binance) {
    lines.push(`      Mode: ${c.binance.mode}`);
    lines.push(`      ${c.binance.statusLabel}`);
  }

  // Telegram
  lines.push("    Telegram MTProto");
  const tgStatus = c.telegram?.status || "warning";
  lines.push(`      Telegram:::${tgStatus === "ok" ? "okn" : "warnn"}`);
  if (c.telegram) {
    lines.push(`      Method: ${c.telegram.method}`);
    lines.push(`      ${c.telegram.statusLabel}`);
  }

  // Database
  lines.push("    Database");
  const dbStatus = c.database?.status || "error";
  lines.push(`      Database:::${dbStatus === "ok" ? "okn" : "errn"}`);
  if (c.database) {
    lines.push(`      Type: ${c.database.type}`);
    lines.push(`      ${c.database.statusLabel}`);
  }

  // Worker
  lines.push("    Background Worker");
  lines.push("      Worker:::warnn");
  if (c.worker) {
    lines.push(`      Poll: ${c.worker.pollIntervalSec}s`);
    lines.push(`      Check: ${c.worker.checkIntervalSec}s`);
    lines.push(`      ${c.worker.statusLabel}`);
  }

  // Trading
  lines.push("    Auto Trading");
  const trStatus = c.trading?.status || "warning";
  lines.push(`      Trading:::${trStatus === "ok" ? "okn" : "warnn"}`);
  if (c.trading) {
    lines.push(`      Leverage: ${c.trading.leverage}x`);
    lines.push(`      Position: ${c.trading.positionSizePct}%`);
    lines.push(`      TP/SL: +${c.trading.takeProfitPct}% / -${c.trading.stopLossPct}%`);
    lines.push(`      ${c.trading.statusLabel}`);
  }

  // UI Dashboard
  lines.push("    UI Dashboard");
  lines.push("      UI:::okn");
  lines.push("      Balance / Stats / Charts");
  lines.push("      Trades / Signals / Logs");
  lines.push("      Settings / Kill Switch");

  // Class definitions
  lines.push("  class okn fill:#10b981,stroke:#059669,color:#fff");
  lines.push("  class warnn fill:#f59e0b,stroke:#d97706,color:#fff");
  lines.push("  class bannedn fill:#ef4444,stroke:#dc2626,color:#fff");
  lines.push("  class errn fill:#ef4444,stroke:#dc2626,color:#fff");

  return lines.join("\n");
}

// ===== Компонент =====
export default function MapPage() {
  const { data, loading, error, refetch } = useApi<HealthResponse>("/api/health", { intervalMs: 15000 });
  const [refreshing, setRefreshing] = useState(false);
  const [mermaidSvg, setMermaidSvg] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Рендерим Mermaid
  useEffect(() => {
    if (!data) return;
    let cancelled = false;

    async function render() {
      try {
        const id = "mermaid-mindmap-" + Date.now();
        const code = generateMermaid(data);
        const { svg } = await meridian.render(id, code);
        if (!cancelled) setMermaidSvg(svg);
      } catch (e: any) {
        console.error("[mermaid] render failed:", e);
      }
    }
    render();
    return () => {
      cancelled = true;
    };
  }, [data]);

  useEffect(() => {
    meridian.initialize({
      startOnLoad: false,
      theme: "default",
      themeVariables: {
        fontFamily: "Geist, system-ui, sans-serif",
        fontSize: "13px",
        primaryColor: "#f1f5f9",
        primaryTextColor: "#0f172a",
        primaryBorderColor: "#cbd5e1",
        lineColor: "#94a3b8",
      },
      mindmap: {
        padding: 16,
        maxNodeWidth: 220,
      },
    });
  }, []);

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
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-amber-600" />
            <div>
              <h1 className="text-sm sm:text-base font-bold tracking-tight">Карта проекта</h1>
              <p className="text-[10px] text-muted-foreground hidden sm:block">
                Архитектура, зависимости и чек-лист готовности
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm">
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
              Обновить
            </Button>
            <Link href="/">
              <Button variant="ghost" size="sm">
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
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">Готовность проекта</div>
              <div className="text-2xl font-bold mt-1 tabular-nums">{checklistPct.toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground mt-1">{checklistDone} из {checklistTotal}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">Компонентов</div>
              <div className="text-2xl font-bold mt-1 tabular-nums">{Object.keys(data?.components || {}).length}</div>
              <div className="text-xs text-muted-foreground mt-1">подсистем</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">БД: записей</div>
              <div className="text-2xl font-bold mt-1 tabular-nums">
                {data?.components.database?.counts
                  ? data.components.database.counts.trades + data.components.database.counts.signals + data.components.database.counts.logs
                  : "—"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">trades + signals + logs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">Последняя проверка</div>
              <div className="text-sm font-semibold mt-1 tabular-nums">
                {data ? new Date(data.timestamp).toLocaleTimeString() : "—"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">обновляется каждые 15 сек</div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <Alert className="border-red-500/20 bg-red-500/5">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-sm text-red-700">Ошибка получения статуса</AlertTitle>
            <AlertDescription className="text-xs text-red-700/80">{error}</AlertDescription>
          </Alert>
        )}

        {/* Mind map */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Boxes className="h-4 w-4" />
              Архитектура проекта
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Зелёный — работает, жёлтый — ожидает настройки, красный — ошибка/IP-бан
            </p>
          </CardHeader>
          <CardContent>
            {loading && !data ? (
              <Skeleton className="h-96 w-full" />
            ) : (
              <div
                ref={containerRef}
                className="w-full overflow-x-auto flex justify-center"
                dangerouslySetInnerHTML={{ __html: mermaidSvg }}
                style={{ minHeight: 400 }}
              />
            )}
          </CardContent>
        </Card>

        {/* Component cards */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileJson className="h-4 w-4" />
              Компоненты системы
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && !data ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
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
                      <h3 className="text-sm font-semibold capitalize flex items-center gap-1.5">
                        {statusIcon(comp.status)}
                        {key === "binance" ? "Binance API" : key === "telegram" ? "Telegram" : key === "database" ? "Database" : key === "worker" ? "Worker" : "Trading"}
                      </h3>
                      <Badge variant="outline" className="text-[10px]">
                        {comp.status === "ok" ? "OK" : comp.status === "warning" ? "WAIT" : comp.status === "banned" ? "BAN" : "ERR"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{comp.statusLabel}</p>

                    {/* Дополнительные детали */}
                    {key === "binance" && comp.configured && (
                      <div className="space-y-0.5 text-[11px] text-muted-foreground">
                        <div>Mode: <span className="font-mono">{comp.mode}</span></div>
                        {comp.latencyMs !== undefined && (
                          <div>Latency: <span className="tabular-nums">{comp.latencyMs}ms</span></div>
                        )}
                      </div>
                    )}
                    {key === "telegram" && (
                      <div className="space-y-0.5 text-[11px] text-muted-foreground">
                        <div>Method: <span className="font-mono">{comp.method}</span></div>
                        {comp.me?.username && (
                          <div>User: <span className="font-mono">@{comp.me.username}</span></div>
                        )}
                      </div>
                    )}
                    {key === "database" && comp.connected && (
                      <div className="space-y-0.5 text-[11px] text-muted-foreground">
                        <div>Type: <span className="font-mono">{comp.type}</span></div>
                        <div className="grid grid-cols-2 gap-1 mt-1">
                          <div>Trades: <span className="tabular-nums">{comp.counts.trades}</span></div>
                          <div>Signals: <span className="tabular-nums">{comp.counts.signals}</span></div>
                          <div>Settings: <span className="tabular-nums">{comp.counts.settings}</span></div>
                          <div>Logs: <span className="tabular-nums">{comp.counts.logs}</span></div>
                        </div>
                      </div>
                    )}
                    {key === "worker" && (
                      <div className="space-y-0.5 text-[11px] text-muted-foreground">
                        <div>Poll: <span className="font-mono">{comp.pollIntervalSec}s</span></div>
                        <div>Check: <span className="font-mono">{comp.checkIntervalSec}s</span></div>
                      </div>
                    )}
                    {key === "trading" && (
                      <div className="space-y-0.5 text-[11px] text-muted-foreground">
                        <div>Leverage: <span className="font-mono">{comp.leverage}x</span></div>
                        <div>Position: <span className="font-mono">{comp.positionSizePct}%</span></div>
                        <div>TP/SL: <span className="font-mono">+{comp.takeProfitPct}% / -{comp.stopLossPct}%</span></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Checklist */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              Чек-лист готовности
              <Badge variant="secondary" className="text-xs ml-auto">
                {checklistDone} / {checklistTotal}
              </Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Что нужно для полноценной работы торгового бота
            </p>
          </CardHeader>
          <CardContent>
            {loading && !data ? (
              <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
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
                        <h4 className="text-sm font-medium">{item.label}</h4>
                        {item.action && (
                          <a
                            href={item.action}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5 underline underline-offset-2"
                          >
                            открыть <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Architecture flow */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Network className="h-4 w-4" />
              Поток данных
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Как сигнал превращается в сделку
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-2 items-stretch overflow-x-auto">
              {[
                { step: "1", title: "Telegram", subtitle: "@cryptoalr", desc: "Парсинг новых сообщений через MTProto каждые 20 сек", icon: "📡" },
                { step: "2", title: "Parser", subtitle: "extract XXXUSDT", desc: "Извлечение symbol, price, % изменения из текста", icon: "🔍" },
                { step: "3", title: "Worker", subtitle: "decision", desc: "Проверка: isPumpSignal? trading enabled?", icon: "⚙️" },
                { step: "4", title: "Binance API", subtitle: "open LONG", desc: "setLeverage → placeMarketOrder (BUY)", icon: "📈" },
                { step: "5", title: "Database", subtitle: "Turso/libSQL", desc: "Сохранение Trade со статусом OPEN", icon: "💾" },
                { step: "6", title: "Monitor", subtitle: "TP/SL check", desc: "Каждые 5 сек проверка цены, закрытие по TP/SL", icon: "🔁" },
                { step: "7", title: "UI Dashboard", subtitle: "real-time", desc: "Отображение баланса, сделок, статистики, графиков", icon: "📊" },
              ].map((s, i, arr) => (
                <div key={s.step} className="flex flex-col md:flex-row gap-2 items-stretch flex-1 min-w-[180px]">
                  <div className="border rounded-md p-3 bg-muted/30 flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-[10px] tabular-nums">{s.step}</Badge>
                      <span className="text-lg">{s.icon}</span>
                    </div>
                    <h4 className="text-sm font-semibold">{s.title}</h4>
                    <p className="text-[10px] text-muted-foreground font-mono">{s.subtitle}</p>
                    <p className="text-[11px] text-muted-foreground mt-1.5">{s.desc}</p>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="hidden md:flex items-center text-muted-foreground px-1">
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t mt-8">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-3 text-center text-xs text-muted-foreground">
          Карта проекта ·{" "}
          <Link href="/" className="hover:text-foreground underline underline-offset-2">
            вернуться к дашборду
          </Link>
        </div>
      </footer>
    </div>
  );
}
