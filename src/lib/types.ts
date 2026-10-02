/**
 * Общие типы данных приложения (используются в UI).
 */

export interface BinanceBalance {
  asset: string;
  walletBalance: number;
  availableBalance: number;
  marginBalance: number;
  maxWithdrawAmount: number;
  crossWalletBalance: number;
}

export interface BinancePosition {
  symbol: string;
  positionAmt: number;
  entryPrice: number;
  markPrice: number;
  unRealizedProfit: number;
  liquidationPrice: number;
  leverage: number;
  maxNotionalValue: number;
  positionSide: string;
}

export interface BinanceConnectivity {
  ok: boolean;
  testnet: boolean;
  demo: boolean;
  latencyMs?: number;
  error?: string;
}

export interface BinanceAccountResponse {
  configured: boolean;
  demo: boolean;
  testnet: boolean;
  connectivity: BinanceConnectivity;
  balance: BinanceBalance[];
  positions: BinancePosition[];
  summary: {
    usdtWallet: number;
    usdtAvailable: number;
    usdtMargin: number;
    unrealizedPnl: number;
    openPositionsCount: number;
  };
  error?: string;
}

export interface Signal {
  id: string;
  telegramId: number;
  channelName: string;
  rawText: string;
  symbol: string | null;
  baseAsset: string | null;
  priceAtSignal: number | null;
  priceChangePct: number | null;
  volumeChangePct: number | null;
  isPumpSignal: boolean;
  tradeId: string | null;
  detectedAt: string;
  createdAt: string;
  trade?: Trade | null;
}

export interface Trade {
  id: string;
  signalId: string | null;
  signal?: Signal | null;
  binanceClientId: number | null;
  binanceOrderId: string | null;
  binancePositionId: string | null;
  symbol: string;
  side: string;
  leverage: number;
  positionSizeUsd: number;
  quantity: number;
  entryPrice: number;
  takeProfitPrice: number;
  stopLossPrice: number;
  exitPrice: number | null;
  pnlUsd: number | null;
  pnlPct: number | null;
  status: "OPEN" | "CLOSED" | "CANCELLED" | "ERROR";
  closeReason: string | null;
  openedAt: string;
  closedAt: string | null;
  updatedAt: string;
  errorMessage: string | null;
  isDemo: boolean;
}

export interface Stats {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPnl: number;
  avgPnl: number;
  bestTrade: { symbol: string; pnlUsd: number; pnlPct: number } | null;
  worstTrade: { symbol: string; pnlUsd: number; pnlPct: number } | null;
  dailyPnl: { day: string; pnl: number }[];
  cumulativePnl: { day: string; cumulative: number }[];
  winLossDist: { wins: number; losses: number; winRate: number };
  bySymbol: { symbol: string; count: number; pnl: number; winRate: number }[];
}

export interface WorkerStatus {
  running: boolean;
  startedAt: number | null;
  lastPollAt: number | null;
  lastPollStatus: "ok" | "error" | null;
  lastPollMessage: string | null;
  lastSignalAt: number | null;
  lastSignalText: string | null;
  lastTradeAt: number | null;
  totalSignalsDetected: number;
  totalTradesExecuted: number;
  totalErrors: number;
}

export interface Settings {
  leverage: number;
  positionSizePct: number;
  takeProfitPct: number;
  stopLossPct: number;
  tradingEnabled: boolean;
  telegramChannel: string;
  pollIntervalSec: number;
  checkIntervalSec: number;
}

export interface AppLog {
  id: string;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG";
  category: string;
  message: string;
  meta: string | null;
  createdAt: string;
}
