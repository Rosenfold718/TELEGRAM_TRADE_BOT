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
  Server,
  Settings2,
  TrendingUp,
  XCircle,
  AlertTriangle,
  Boxes,
  Layers,
  Cpu,
  Zap,
  Radio,
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
  // дополнительные поля
  [key: string]: any;
}

interface ChecklistItem {
  id: string;
  label: string;
  status: "done" | "pending" | "warning";
  description: string;
  action?: string;
}

// ===== Типы для узлов =====
interface GraphNode {
  id: string;
  label: string;
  type: "telegram" | "parser" | "worker" | "binance" | "database" | "monitor" | "ui" | "root";
  layer: "external" | "logic" | "external-api" | "data" | "ui";
  status: "ok" | "warning" | "banned" | "error" | "neutral";
  statusLabel: string;
  icon: typeof Bot;
  // Координаты в % (0-100), адаптируется под responsive
  x: number;
  y: number;
  details: { label: string; value: string }[];
}

interface GraphEdge {
  from: string;
  to: string;
  label?: string;
  animated?: boolean;
}

// ===== Утилиты =====
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
          minWidth: 110,
          maxWidth: 160,
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
function GraphEdgeView({
  edge,
  nodes,
}: {
  edge: GraphEdge;
  nodes: GraphNode[];
}) {
  const from = nodes.find((n) => n.id === edge.from);
  const to = nodes.find((n) => n.id === edge.to);
  if (!from || !to) return null;

  // SVG path в % координатах
  const fromX = from.x;
  const fromY = from.y;
  const toX = to.x;
  const toY = to.y;

  // Curved path (quadratic bezier)
  const midX = (fromX + toX) / 2;
  const midY = (fromY + toY) / 2;
  const dx = toX - fromX;
  const dy = toY - fromY;
  // Curvature perpendicular to the line
  const offset = 8; // adjust curve
  const path = `M ${fromX} ${fromY} Q ${midX - dy * offset / 100} ${midY + dx * offset / 100} ${toX} ${toY}`;

  const isActive = from.status === "ok" || from.status === "warning";

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
      {/* Animated dot along path */}
      {isActive && (
        <motion.circle
          r={0.6}
          fill="#38bdf8"
          animate={{
            offsetDistance: ["0%", "100%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            offsetPath: `path("${path}")`,
            offsetRotate: "0deg",
          }}
        />
      )}
    </svg>
  );
}

// ===== Главный компонент =====
export function InteractiveGraph() {
  const { data, loading, refetch } = useApi<HealthResponse>("/api/health", { intervalMs: 15000 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Строим узлы на основе health data
  const nodes: GraphNode[] = useMemo(() => {
    if (!data) return [];
    const c = data.components;

    return [
      // Root (центр)
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
        details: [
          { label: "Version", value: "1.0.0" },
          { label: "Status", value: "Running" },
          { label: "Readiness", value: `${data.checklist.filter((i) => i.status === "done").length}/${data.checklist.length}` },
        ],
      },
      // Telegram (источник сигналов)
      {
        id: "telegram",
        label: "Telegram",
        type: "telegram",
        layer: "external",
        status: c.telegram?.status || "warning",
        statusLabel: c.telegram?.statusLabel || "Not configured",
        icon: Send,
        x: 12,
        y: 20,
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
        x: 28,
        y: 35,
        details: [
          { label: "Pattern", value: "XXXUSDT IS PUMPING" },
          { label: "Fields", value: "symbol, price, %" },
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
        x: 45,
        y: 70,
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
        x: 80,
        y: 28,
        details: [
          { label: "Mode", value: c.binance?.mode || "—" },
          { label: "Latency", value: c.binance?.latencyMs ? `${c.binance.latencyMs}ms` : "—" },
          { label: "Status", value: c.binance?.statusLabel || "—" },
        ],
      },
      // Database
      {
        id: "database",
        label: "Database",
        type: "database",
        layer: "data",
        status: c.database?.status || "error",
        statusLabel: c.database?.statusLabel || "Not connected",
        icon: Database,
        x: 70,
        y: 75,
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
        x: 88,
        y: 55,
        details: [
          { label: "Components", value: "12 cards" },
          { label: "Real-time", value: "every 5-30s" },
          { label: "Status", value: "Live" },
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
            <p className="text-[10px] text-slate-400">Click any node to see details · Updates every 15s</p>
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
                height: "560px",
                background: `
                  radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.05) 0%, transparent 50%),
                  radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 40%),
                  radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.08) 0%, transparent 40%),
                  #0f172a
                `,
              }}
            >
              {/* Grid background pattern */}
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

              {/* Edges (connections) */}
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

        {/* Details panel */}
        <Card className="bg-slate-900/70 border-slate-700 backdrop-blur-sm">
          <CardContent className="p-4">
            <AnimatePresence mode="wait">
              {selectedNode ? (
                <motion.div
                  key={selectedNode.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Node header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="flex items-center justify-center w-12 h-12 rounded-xl"
                      style={{
                        background: STATUS_COLORS[selectedNode.status].bg,
                        border: `1px solid ${STATUS_COLORS[selectedNode.status].border}`,
                      }}
                    >
                      <selectedNode.icon
                        className="h-6 w-6"
                        style={{ color: STATUS_COLORS[selectedNode.status].text }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-slate-100">
                        {selectedNode.label}
                      </h3>
                      <Badge
                        variant="outline"
                        className="text-xs mt-1"
                        style={{
                          color: STATUS_COLORS[selectedNode.status].text,
                          borderColor: STATUS_COLORS[selectedNode.status].border,
                          background: STATUS_COLORS[selectedNode.status].bg,
                        }}
                      >
                        {selectedNode.status === "ok" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {selectedNode.status === "warning" && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {(selectedNode.status === "banned" || selectedNode.status === "error") && (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {selectedNode.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  {/* Status label */}
                  <div className="mb-4 p-2 rounded-md bg-slate-800/50 border border-slate-700">
                    <p className="text-xs text-slate-300">{selectedNode.statusLabel}</p>
                  </div>

                  {/* Layer badge */}
                  <div className="mb-3 flex items-center gap-2">
                    <Layers className="h-3 w-3 text-slate-500" />
                    <span className="text-[10px] text-slate-400 uppercase tracking-wide">
                      {LAYER_LABELS[selectedNode.layer]?.label}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5">
                    {selectedNode.details.map((d, i) => (
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

                  {/* Type */}
                  <div className="mt-4 pt-3 border-t border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 uppercase">Node type</span>
                      <span className="text-xs font-mono text-cyan-400">{selectedNode.type}</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <Boxes className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Click a node to see details</p>
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
