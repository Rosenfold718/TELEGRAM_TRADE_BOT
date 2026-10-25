"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  ArrowRight,
  Bot,
  CheckCircle2,
  Database,
  RefreshCw,
  Send,
  Settings2,
  TrendingUp,
  XCircle,
  AlertTriangle,
  Boxes,
  Layers,
  Cpu,
  Zap,
  Radio,
  ExternalLink,
  Info,
  Lightbulb,
  Wrench,
  ShieldAlert,
} from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { toast } from "sonner";

interface HealthResponse {
  timestamp: string;
  components: {
    binance?: ComponentInfo;
    telegram?: ComponentInfo;
    database?: ComponentInfo;
    worker?: ComponentInfo;
    trading?: ComponentInfo;
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

// ===== Расширенные типы для узлов =====
interface GraphNode {
  id: string;
  label: string;
  type: "telegram" | "parser" | "worker" | "binance" | "database" | "monitor" | "ui" | "root";
  layer: "external" | "logic" | "external-api" | "data" | "ui";
  status: "ok" | "warning" | "banned" | "error" | "neutral";
  statusLabel: string;
  icon: typeof Bot;
  x: number;
  y: number;
  // Краткие детали (для small panel)
  details: { label: string; value: string }[];
  // Полное описание (для расширенной панели)
  description: string;
  // Что подключено / работает
  connected: string[];
  // Что не подключено / требует настройки
  disconnected: string[];
  // Текущие ошибки
  errors: string[];
  // Рекомендации по устранению
  recommendations: { text: string; link?: string }[];
  // Действия (кнопки)
  actions: { label: string; link?: string; type: "internal" | "external" | "settings" }[];
}

interface GraphEdge {
  from: string;
  to: string;
  label?: string;
  animated?: boolean;
}

// ===== Цвета статусов =====
const STATUS_COLORS: Record<string, { bg: string; border: string; text: string; glow: string; dot: string }> = {
  ok: { bg: "rgba(16, 185, 129, 0.1)", border: "rgba(16, 185, 129, 0.4)", text: "#34d399", glow: "rgba(16, 185, 129, 0.3)", dot: "#10b981" },
  warning: { bg: "rgba(245, 158, 11, 0.1)", border: "rgba(245, 158, 11, 0.4)", text: "#fbbf24", glow: "rgba(245, 158, 11, 0.3)", dot: "#f59e0b" },
  banned: { bg: "rgba(239, 68, 68, 0.1)", border: "rgba(239, 68, 68, 0.4)", text: "#f87171", glow: "rgba(239, 68, 68, 0.3)", dot: "#ef4444" },
  error: { bg: "rgba(239, 68, 68, 0.1)", border: "rgba(239, 68, 68, 0.4)", text: "#f87171", glow: "rgba(239, 68, 68, 0.3)", dot: "#ef4444" },
  neutral: { bg: "rgba(148, 163, 184, 0.08)", border: "rgba(148, 163, 184, 0.3)", text: "#cbd5e1", glow: "rgba(148, 163, 184, 0.2)", dot: "#64748b" },
};

const LAYER_LABELS: Record<string, { label: string; color: string }> = {
  external: { label: "External Sources", color: "#8b5cf6" },
  logic: { label: "Application Logic", color: "#06b6d4" },
  "external-api": { label: "External APIs", color: "#f97316" },
  data: { label: "Data Layer", color: "#10b981" },
  ui: { label: "User Interface", color: "#ec4899" },
};

// ===== Компонент GraphNode (узел графа) =====
function GraphNodeView({
  node,
  isSelected,
  onClick,
}: {
  node: GraphNode;
  isSelected: boolean;
  onClick: () => void;
}) {
  const Icon = node.icon;
  const colors = STATUS_COLORS[node.status];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, type: "spring" }}
      whileHover={{ scale: 1.05, y: -2 }}
      onClick={onClick}
      className="absolute cursor-pointer group"
      style={{
        left: `${node.x}%`,
        top: `${node.y}%`,
        transform: "translate(-50%, -50%)",
        zIndex: isSelected ? 30 : 10,
      }}
    >
      {/* Glow */}
      <div
        className="absolute inset-0 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: colors.glow }}
      />

      {/* Node body */}
      <motion.div
        animate={isSelected ? { scale: 1.05 } : { scale: 1 }}
        className="relative flex flex-col items-center gap-2 p-3 rounded-2xl border backdrop-blur-md transition-all"
        style={{
          background: `linear-gradient(135deg, ${colors.bg}, rgba(15, 23, 42, 0.7))`,
          borderColor: isSelected ? colors.text : colors.border,
          boxShadow: isSelected ? `0 0 30px ${colors.glow}` : `0 0 12px rgba(0, 0, 0, 0.4)`,
          minWidth: 120,
          maxWidth: 170,
        }}
      >
        {/* Status dot */}
        <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
          {node.status === "ok" && <CheckCircle2 className="h-3 w-3" style={{ color: colors.text }} />}
          {node.status === "warning" && <AlertTriangle className="h-3 w-3" style={{ color: colors.text }} />}
          {(node.status === "banned" || node.status === "error") && <XCircle className="h-3 w-3" style={{ color: colors.text }} />}
        </div>

        {/* Icon */}
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl"
          style={{ background: colors.glow }}
        >
          <Icon className="h-5 w-5" style={{ color: colors.text }} />
        </div>

        {/* Label */}
        <div className="text-xs font-semibold text-center" style={{ color: colors.text }}>
          {node.label}
        </div>

        {/* Status pulse for active nodes */}
        {node.status === "ok" && (
          <motion.div
            className="absolute -top-1 -left-1 w-2 h-2 rounded-full"
            style={{ backgroundColor: colors.dot }}
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}

// ===== Компонент GraphEdge (связь между узлами) =====
function GraphEdgeView({ edge, nodes }: { edge: GraphEdge; nodes: GraphNode[] }) {
  const from = nodes.find((n) => n.id === edge.from);
  const to = nodes.find((n) => n.id === edge.to);
  if (!from || !to) return null;

  const fromX = from.x;
  const fromY = from.y;
  const toX = to.x;
  const toY = to.y;

  // Curved path (quadratic bezier)
  const midX = (fromX + toX) / 2;
  const midY = (fromY + toY) / 2;
  const dx = toX - fromX;
  const dy = toY - fromY;
  const offset = 8;
  const path = `M ${fromX} ${fromY} Q ${midX - (dy * offset) / 100} ${midY + (dx * offset) / 100} ${toX} ${toY}`;

  const isActive = from.status === "ok" || from.status === "warning" || from.status === "neutral";

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <motion.path
        d={path}
        stroke={isActive ? "rgba(56, 189, 248, 0.5)" : "rgba(148, 163, 184, 0.2)"}
        strokeWidth={0.4}
        fill="none"
        strokeDasharray="1 1"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
      />
      {isActive && (
        <motion.circle
          r={0.6}
          fill="#38bdf8"
          animate={{ offsetDistance: ["0%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{
            offsetPath: `path("${path}")`,
            offsetRotate: "0deg",
          }}
        />
      )}
    </svg>
  );
}

// ===== Расширенная панель деталей =====
function DetailsPanel({ node, data }: { node: GraphNode; data: HealthResponse }) {
  const colors = STATUS_COLORS[node.status];

  return (
    <motion.div
      key={node.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="space-y-3"
    >
      {/* Node header */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-12 h-12 rounded-xl"
          style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
        >
          <node.icon className="h-6 w-6" style={{ color: colors.text }} />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-slate-100">{node.label}</h3>
          <Badge
            variant="outline"
            className="text-xs mt-1"
            style={{ color: colors.text, borderColor: colors.border, background: colors.bg }}
          >
            {node.status === "ok" && <CheckCircle2 className="h-3 w-3 mr-1" />}
            {node.status === "warning" && <AlertTriangle className="h-3 w-3 mr-1" />}
            {(node.status === "banned" || node.status === "error") && <XCircle className="h-3 w-3 mr-1" />}
            {node.status === "neutral" && <Info className="h-3 w-3 mr-1" />}
            {node.status.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Layer badge */}
      <div className="flex items-center gap-2 text-[10px]">
        <Layers className="h-3 w-3 text-slate-500" />
        <span className="text-slate-400 uppercase tracking-wide">
          {LAYER_LABELS[node.layer]?.label}
        </span>
      </div>

      {/* Description */}
      <div className="p-2.5 rounded-md bg-slate-800/50 border border-slate-700">
        <p className="text-xs text-slate-300 leading-relaxed">{node.description}</p>
      </div>

      {/* What's connected (good) */}
      {node.connected.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Подключено / работает
          </div>
          <ul className="space-y-1 ml-5">
            {node.connected.map((item, i) => (
              <li key={i} className="text-xs text-slate-300 list-disc">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* What's missing */}
      {node.disconnected.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            Не подключено / требует настройки
          </div>
          <ul className="space-y-1 ml-5">
            {node.disconnected.map((item, i) => (
              <li key={i} className="text-xs text-slate-300 list-disc">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Errors */}
      {node.errors.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-red-400">
            <ShieldAlert className="h-3.5 w-3.5" />
            Текущие ошибки
          </div>
          <div className="space-y-1.5">
            {node.errors.map((err, i) => (
              <div
                key={i}
                className="p-2 rounded-md bg-red-500/10 border border-red-500/30 text-[11px] text-red-300 font-mono"
              >
                {err}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {node.recommendations.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-cyan-400">
            <Lightbulb className="h-3.5 w-3.5" />
            Рекомендации по устранению
          </div>
          <ol className="space-y-1.5 ml-5">
            {node.recommendations.map((rec, i) => (
              <li key={i} className="text-xs text-slate-300 list-decimal">
                {rec.text}
                {rec.link && (
                  <a
                    href={rec.link}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-1 inline-flex items-center gap-0.5 text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
                  >
                    открыть <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Quick details (key-value) */}
      {node.details.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-slate-400">
            <Info className="h-3.5 w-3.5" />
            Детали
          </div>
          <div className="space-y-1">
            {node.details.map((d, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-1.5 px-2 rounded-md bg-slate-800/30 hover:bg-slate-800/60 transition-colors"
              >
                <span className="text-xs text-slate-400">{d.label}</span>
                <span className="text-xs font-mono text-slate-200 text-right max-w-[60%] truncate">
                  {d.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {node.actions.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-slate-400">
            <Wrench className="h-3.5 w-3.5" />
            Действия
          </div>
          <div className="flex flex-wrap gap-2">
            {node.actions.map((action, i) => {
              if (action.link) {
                return (
                  <a key={i} href={action.link} target="_blank" rel="noreferrer">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white"
                    >
                      {action.label}
                      <ExternalLink className="h-3 w-3 ml-1.5" />
                    </Button>
                  </a>
                );
              }
              if (action.type === "internal") {
                return (
                  <a key={i} href="/">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white"
                    >
                      {action.label}
                      <ArrowRight className="h-3 w-3 ml-1.5" />
                    </Button>
                  </a>
                );
              }
              if (action.type === "settings") {
                return (
                  <a key={i} href="/#settings">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white"
                    >
                      <Settings2 className="h-3 w-3 mr-1.5" />
                      {action.label}
                    </Button>
                  </a>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ===== Главный компонент =====
export function InteractiveGraph() {
  const { data, loading, refetch } = useApi<HealthResponse>("/api/health", { intervalMs: 15000 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Строим узлы с детальной информацией
  const nodes: GraphNode[] = useMemo(() => {
    if (!data) return [];
    const c = data.components;
    const isBanned = c.binance?.error?.includes("banned") || c.binance?.error?.includes("418");
    const is401 = c.binance?.error?.includes("401") || c.binance?.error?.includes("Invalid API-key");

    return [
      // Root
      {
        id: "root",
        label: "Crypto Signals Trader",
        type: "root",
        layer: "logic",
        status: "neutral",
        statusLabel: "Active application",
        icon: Bot,
        x: 50,
        y: 50,
        description:
          "Главное приложение для автоматического трейдинга на Binance USDT-M Futures по сигналам из Telegram-канала @cryptoalr. Построено на Next.js 16 + Prisma + Turso.",
        connected: [
          "Next.js 16 с Turbopack запущен",
          "Prisma ORM подключен через адаптер",
          `Telegram канал: ${process.env.TELEGRAM_CHANNEL || "cryptoalr"}`,
        ],
        disconnected: [],
        errors: [],
        recommendations: [],
        actions: [
          { label: "Открыть дашборд", type: "internal" },
          { label: "GitHub repo", link: "https://github.com/Rosenfold718/TELEGRAM_TRADE_BOT", type: "external" },
        ],
        details: [
          { label: "Version", value: "1.0.0" },
          { label: "Framework", value: "Next.js 16" },
          { label: "Readiness", value: `${data.checklist.filter((i) => i.status === "done").length}/${data.checklist.length}` },
        ],
      },

      // Telegram
      {
        id: "telegram",
        label: "Telegram",
        type: "telegram",
        layer: "external",
        status: c.telegram?.status || "warning",
        statusLabel: c.telegram?.statusLabel || "Not configured",
        icon: Send,
        x: 12,
        y: 18,
        description:
          "Подключение к Telegram через User API (MTProto) для чтения сообщений из канала. Web scraping (t.me/s/) работает только для публичных каналов с превью, поэтому рекомендуется MTProto.",
        connected: c.telegram?.configured
          ? [
              `api_id и api_hash настроены`,
              `Авторизован как: ${c.telegram?.me?.firstName || "пользователь"}`,
              `Method: ${c.telegram?.method}`,
            ]
          : ["Telegram polling готов к запуску (worker)"],
        disconnected: c.telegram?.configured
          ? []
          : [
              "api_id и api_hash (получить на my.telegram.org)",
              "session string (через telegram-login.ts)",
              "Аккаунт Telegram авторизован",
            ],
        errors: c.telegram?.error ? [c.telegram.error] : [],
        recommendations: c.telegram?.configured
          ? []
          : [
              { text: "Перейди на my.telegram.org → API development tools", link: "https://my.telegram.org" },
              { text: "Создай приложение (App title, Short name — любые, Platform: Other)" },
              { text: "Скопируй api_id и api_hash" },
              { text: "Добавь их в .env (TELEGRAM_API_ID, TELEGRAM_API_HASH)" },
              { text: "Запусти: bun run scripts/telegram-login.ts — авторизуйся по номеру телефона" },
              { text: "Скопируй session string в .env (TELEGRAM_SESSION)" },
            ],
        actions: [
          { label: "my.telegram.org", link: "https://my.telegram.org", type: "external" },
        ],
        details: [
          { label: "Method", value: c.telegram?.method || "—" },
          { label: "Channel", value: process.env.TELEGRAM_CHANNEL || "cryptoalr" },
          { label: "Status", value: c.telegram?.statusLabel || "—" },
        ],
      },

      // Parser
      {
        id: "parser",
        label: "Signal Parser",
        type: "parser",
        layer: "logic",
        status: "ok",
        statusLabel: "Ready to parse signals",
        icon: Radio,
        x: 12,
        y: 50,
        description:
          "Извлекает данные из сообщений Telegram: символ (например, USUSDT), текущую цену, % изменения цены, % изменения объёма. Использует regex-паттерны для поиска 'XXXUSDT IS PUMPING' и 'CURRENT PRICE:'.",
        connected: [
          "Regex паттерны определены",
          "Поддержка emoji-символов в сообщениях",
          "Извлечение: symbol, priceAtSignal, priceChangePct, volumeChangePct",
        ],
        disconnected: [],
        errors: [],
        recommendations: [],
        actions: [],
        details: [
          { label: "Pattern", value: "XXXUSDT IS PUMPING" },
          { label: "Fields extracted", value: "4 (symbol, price, %, vol)" },
          { label: "Status", value: "Active" },
        ],
      },

      // Worker
      {
        id: "worker",
        label: "Background Worker",
        type: "worker",
        layer: "logic",
        status: "ok",
        statusLabel: c.worker?.statusLabel || "Ready",
        icon: Cpu,
        x: 35,
        y: 75,
        description:
          "Синглтон-процесс, который каждые N секунд парсит Telegram, при нахождении сигнала — открывает LONG на Binance с плечом, мониторит TP/SL и закрывает сделку. Запускается кнопкой Start в UI.",
        connected: [
          "Singleton pattern реализован",
          `Poll interval: ${c.worker?.pollIntervalSec || 20}s`,
          `Check interval: ${c.worker?.checkIntervalSec || 5}s`,
          "API: /api/worker (start, stop, killall)",
        ],
        disconnected: ["Worker не запущен (нажми Start в дашборде)"],
        errors: [],
        recommendations: [
          { text: "Открой дашборд и нажми кнопку 'Start' в карточке Worker", type: "internal" as any },
          { text: "Для 24/7 работы — задеплой на Vercel/VPS" },
        ],
        actions: [
          { label: "Открыть дашборд", type: "internal" },
        ],
        details: [
          { label: "Poll interval", value: `${c.worker?.pollIntervalSec || 20}s` },
          { label: "Check interval", value: `${c.worker?.checkIntervalSec || 5}s` },
          { label: "Status", value: c.worker?.statusLabel || "—" },
        ],
      },

      // Binance
      {
        id: "binance",
        label: "Binance Futures",
        type: "binance",
        layer: "external-api",
        status: c.binance?.status || "warning",
        statusLabel: c.binance?.statusLabel || "Not configured",
        icon: TrendingUp,
        x: 85,
        y: 18,
        description:
          "Подключение к Binance USDT-M Futures REST API для получения баланса, открытия/закрытия позиций с плечом до 125x. Использует HMAC-SHA256 подпись запросов.",
        connected: c.binance?.configured
          ? [
              `API ключ и секрет настроены`,
              `Mode: ${c.binance?.mode}`,
              `Кэширование запросов: 15 сек (баланс), 5 сек (цены)`,
            ]
          : [],
        disconnected: c.binance?.configured
          ? []
          : [
              "BINANCE_API_KEY в .env",
              "BINANCE_API_SECRET в .env",
              "Аккаунт Binance с открытым Futures-кошельком",
            ],
        errors: c.binance?.error ? [c.binance.error] : [],
        recommendations: c.binance?.configured
          ? isBanned
            ? [
                { text: "IP забанен на 2-24 часа — дождись окончания или задеплой на Vercel/VPS (там другой IP)" },
                { text: "Проверь, что в Binance API Restrictions добавлен твой IP" },
                { text: "Убедись, что IP-фильтр активирован (Restrict access to trusted IPs only)" },
                { text: "После снятия бана включи Futures Trading permission" },
              ]
            : is401
            ? [
                { text: "401: API ключ отклонён. Возможные причины:" },
                { text: "1. Твой текущий IP не добавлен в Binance API Restrictions" },
                { text: "2. API ключ не имеет прав на Futures Trading" },
                { text: "3. API ключ был удалён или перевыпущен" },
                { text: "Решение: добавь свой IP в Binance API и проверь права ключа", link: "https://www.binance.com/en/my/settings/api-management" },
              ]
            : []
          : [
              { text: "Перейди на Binance API Management", link: "https://www.binance.com/en/my/settings/api-management" },
              { text: "Создай новый API ключ (нужны права: Read + Futures Trading)" },
              { text: "Включи 'Restrict access to trusted IPs only' и добавь свой IP" },
              { text: "Узнать свой IP: https://api.ipify.org", link: "https://api.ipify.org" },
              { text: "Включи галочку 'Enable Futures' (после IP-фильтра)" },
              { text: "Скопируй API Key и Secret Key в .env" },
            ],
        actions: [
          { label: "Binance API Settings", link: "https://www.binance.com/en/my/settings/api-management", type: "external" },
          { label: "Узнать мой IP", link: "https://api.ipify.org", type: "external" },
        ],
        details: [
          { label: "Mode", value: c.binance?.mode || "—" },
          { label: "Latency", value: c.binance?.latencyMs ? `${c.binance.latencyMs}ms` : "—" },
          { label: "Status", value: c.binance?.statusLabel || "—" },
        ],
      },

      // Database
      {
        id: "database",
        label: "Database (Turso)",
        type: "database",
        layer: "data",
        status: c.database?.status || "error",
        statusLabel: c.database?.statusLabel || "Not connected",
        icon: Database,
        x: 85,
        y: 75,
        description:
          "Облачная база данных Turso (libSQL, совместима с SQLite). Хранит сигналы, сделки, настройки, логи. Подключается через Prisma adapter — работает и локально, и на Vercel.",
        connected: c.database?.connected
          ? [
              `Type: ${c.database?.type}`,
              `URL: ${c.database?.url}`,
              `Trades: ${c.database?.counts?.trades || 0}`,
              `Signals: ${c.database?.counts?.signals || 0}`,
              `Settings: ${c.database?.counts?.settings || 0}`,
              `Logs: ${c.database?.counts?.logs || 0}`,
            ]
          : [],
        disconnected: c.database?.connected
          ? []
          : ["DATABASE_URL в .env", "DATABASE_AUTH_TOKEN в .env"],
        errors: c.database?.error ? [c.database.error] : [],
        recommendations: c.database?.connected
          ? []
          : [
              { text: "Зарегистрируйся на Turso (бесплатно)", link: "https://turso.tech" },
              { text: "Создай новую БД: turso db create" },
              { text: "Получи URL: turso db show <name>" },
              { text: "Создай token: turso db tokens create <name>" },
              { text: "Добавь DATABASE_URL и DATABASE_AUTH_TOKEN в .env" },
              { text: "Запусти миграцию: bun run scripts/turso-migrate.ts" },
              { text: "Заполни демо-данными: bun run scripts/seed-turso.ts" },
            ],
        actions: [
          { label: "Turso Dashboard", link: "https://turso.tech", type: "external" },
        ],
        details: [
          { label: "Type", value: c.database?.type || "—" },
          { label: "Trades", value: String(c.database?.counts?.trades || 0) },
          { label: "Signals", value: String(c.database?.counts?.signals || 0) },
          { label: "Logs", value: String(c.database?.counts?.logs || 0) },
        ],
      },

      // UI
      {
        id: "ui",
        label: "UI Dashboard",
        type: "ui",
        layer: "ui",
        status: "ok",
        statusLabel: "Running (you're seeing it)",
        icon: Activity,
        x: 50,
        y: 22,
        description:
          "Next.js App Router dashboard с real-time обновлениями. Отображает баланс Binance, статистику сделок, графики P&L, win/loss ratio, список сделок, сигналов, логов, и карту проекта.",
        connected: [
          "12 карточек компонентов (Balance, Stats, Charts, Trades, Signals, Logs, Worker, Settings, KillSwitch, TelegramStatus, InfoBanner)",
          "Auto-refresh каждые 5-30 сек",
          "Push-уведомления через Service Worker",
          "Темная и светлая темы",
          "Responsive: mobile + tablet + desktop",
        ],
        disconnected: [],
        errors: [],
        recommendations: [],
        actions: [
          { label: "Открыть дашборд", type: "internal" },
          { label: "Изменить настройки", type: "settings" },
        ],
        details: [
          { label: "Components", value: "12 cards" },
          { label: "Real-time", value: "every 5-30s" },
          { label: "Themes", value: "light + dark" },
        ],
      },
    ];
  }, [data]);

  // Связи между узлами (поток данных)
  const edges: GraphEdge[] = [
    { from: "telegram", to: "parser", label: "messages", animated: true },
    { from: "parser", to: "worker", label: "signal" },
    { from: "worker", to: "binance", label: "orders", animated: true },
    { from: "binance", to: "database", label: "save trade" },
    { from: "worker", to: "database", label: "save signal" },
    { from: "database", to: "ui", label: "fetch data", animated: true },
    { from: "worker", to: "ui", label: "status" },
  ];

  const selectedNode = nodes.find((n) => n.id === selectedId);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      toast.success("Status refreshed");
    } finally {
      setRefreshing(false);
    }
  };

  // Auto-select root when data loads
  useEffect(() => {
    if (!selectedId && nodes.length > 0) {
      setSelectedId("root");
    }
  }, [nodes, selectedId]);

  if (loading && !data) {
    return (
      <Card className="bg-slate-900/50 border-slate-700">
        <CardContent className="p-6">
          <Skeleton className="h-96 w-full bg-slate-800" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Top toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500 blur-md opacity-30 rounded-full" />
            <Boxes className="relative h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Interactive Architecture</h2>
            <p className="text-[10px] text-slate-400">
              Click any node to see full details, errors, recommendations · Updates every 15s
            </p>
          </div>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
          className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Layer legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(LAYER_LABELS).map(([key, val]) => (
          <div key={key} className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: val.color }} />
            {val.label}
          </div>
        ))}
      </div>

      {/* Main graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Graph canvas */}
        <Card className="lg:col-span-2 bg-slate-900/70 border-slate-700 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-0">
            <div
              className="relative w-full"
              style={{
                height: "600px",
                background: `
                  radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.05) 0%, transparent 50%),
                  radial-gradient(circle at 12% 18%, rgba(139, 92, 246, 0.1) 0%, transparent 30%),
                  radial-gradient(circle at 85% 18%, rgba(249, 115, 22, 0.1) 0%, transparent 30%),
                  radial-gradient(circle at 85% 75%, rgba(16, 185, 129, 0.1) 0%, transparent 30%),
                  radial-gradient(circle at 12% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 30%),
                  radial-gradient(circle at 35% 75%, rgba(6, 182, 212, 0.1) 0%, transparent 30%),
                  radial-gradient(circle at 50% 22%, rgba(236, 72, 153, 0.1) 0%, transparent 30%),
                  #0f172a
                `,
              }}
            >
              {/* Grid background */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: "30px 30px",
                }}
              />

              {/* Edges */}
              {edges.map((edge, i) => (
                <GraphEdgeView key={i} edge={edge} nodes={nodes} />
              ))}

              {/* Nodes */}
              {nodes.map((node) => (
                <GraphNodeView
                  key={node.id}
                  node={node}
                  isSelected={selectedId === node.id}
                  onClick={() => setSelectedId(node.id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Details panel (больше места для расширенной информации) */}
        <Card className="bg-slate-900/70 border-slate-700 backdrop-blur-sm">
          <CardContent className="p-4 max-h-[600px] overflow-y-auto">
            <AnimatePresence mode="wait">
              {selectedNode ? (
                <DetailsPanel node={selectedNode} data={data} />
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <Boxes className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Click a node to see full details</p>
                </div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>

      {/* Mini data flow */}
      <Card className="bg-slate-900/70 border-slate-700 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-100">Data flow</h3>
            <span className="text-[10px] text-slate-400 ml-2">How a signal becomes a trade</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 overflow-x-auto">
            {[
              { step: "1", title: "Telegram", desc: "New message in @cryptoalr", icon: Send, color: "#8b5cf6" },
              { step: "2", title: "Parser", desc: "Extract symbol, price, %", icon: Radio, color: "#06b6d4" },
              { step: "3", title: "Worker", desc: "Decision: trade or skip?", icon: Cpu, color: "#06b6d4" },
              { step: "4", title: "Binance", desc: "Place LONG with leverage", icon: TrendingUp, color: "#f97316" },
              { step: "5", title: "Database", desc: "Save Trade (status OPEN)", icon: Database, color: "#10b981" },
              { step: "6", title: "Monitor", desc: "Check TP/SL every 5s", icon: Activity, color: "#06b6d4" },
              { step: "7", title: "UI", desc: "Show in dashboard", icon: Activity, color: "#ec4899" },
            ].map((s, i, arr) => (
              <div key={s.step} className="flex flex-col sm:flex-row gap-2 items-stretch flex-1 min-w-[140px]">
                <div className="border border-slate-700 rounded-md p-2 bg-slate-800/40 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <Badge
                      variant="outline"
                      className="text-[10px] tabular-nums"
                      style={{ color: s.color, borderColor: s.color, background: `${s.color}1a` }}
                    >
                      {s.step}
                    </Badge>
                    <s.icon className="h-3.5 w-3.5" style={{ color: s.color }} />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-100">{s.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{s.desc}</p>
                </div>
                {i < arr.length - 1 && (
                  <div className="flex items-center justify-center text-slate-600 px-0.5">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
