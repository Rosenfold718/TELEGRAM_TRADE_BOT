/**
 * Binance USDT-M Futures REST API клиент.
 * Поддерживает mainnet, testnet и DEMO режим (mock данные когда нет API ключей).
 *
 * Документация: https://binance-docs.github.io/apidocs/futures/en/
 *
 * Endpoints:
 *  - Mainnet: https://fapi.binance.com
 *  - Testnet:  https://testnet.binancefuture.com
 */

import crypto from "crypto";
import { cached } from "@/lib/cache";

const MAINNET_BASE = "https://fapi.binance.com";
const TESTNET_BASE = "https://testnet.binancefuture.com";

// ===== Типы =====

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
  positionSide: string; // BOTH / LONG / SHORT
}

export interface BinanceSymbolInfo {
  symbol: string;
  status: string; // TRADING
  baseAsset: string;
  quoteAsset: string;
  pricePrecision: number;
  quantityPrecision: number;
  minQty: number;
  stepSize: number;
  tickSize: number;
}

export interface BinanceTickerPrice {
  symbol: string;
  price: number;
  time: number;
}

export interface BinanceOrderResponse {
  orderId: string;
  symbol: string;
  status: string; // NEW / FILLED / CANCELED / etc.
  side: string; // BUY / SELL
  type: string; // MARKET / LIMIT
  origQty: number;
  avgPrice: number;
  executedQty: number;
  cumQuote: number;
  clientOrderId: string;
  closePosition: boolean;
}

// ===== Утилиты =====

function getBaseUrl(): string {
  const testnet = process.env.BINANCE_TESTNET === "true";
  return testnet ? TESTNET_BASE : MAINNET_BASE;
}

export function isBinanceConfigured(): boolean {
  return Boolean(process.env.BINANCE_API_KEY && process.env.BINANCE_API_SECRET);
}

function sign(queryString: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(queryString).digest("hex");
}

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  return Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
}

async function binanceRequest<T = any>(
  path: string,
  params: Record<string, string | number | boolean | undefined> = {},
  method: "GET" | "POST" | "DELETE" = "GET",
  signed = false
): Promise<T> {
  const apiKey = process.env.BINANCE_API_KEY;
  const apiSecret = process.env.BINANCE_API_SECRET;

  if (signed && (!apiKey || !apiSecret)) {
    throw new Error("Binance API keys не настроены. Добавь BINANCE_API_KEY и BINANCE_API_SECRET в .env");
  }

  const timestamp = Date.now();
  let query = buildQuery({ ...params, timestamp });

  if (signed) {
    query = buildQuery({ ...params, timestamp, recvWindow: 5000 });
    query += `&signature=${sign(query, apiSecret!)}`;
  }

  const url = signed
    ? `${getBaseUrl()}${path}?${query}`
    : `${getBaseUrl()}${path}${query ? `?${query}` : ""}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) headers["X-MBX-APIKEY"] = apiKey;

  const response = await fetch(url, { method, headers });

  if (!response.ok) {
    const text = await response.text();
    let errMsg = text;
    try {
      const j = JSON.parse(text);
      errMsg = j.msg || text;
    } catch {}
    throw new Error(`Binance API ${response.status}: ${errMsg}`);
  }

  return response.json();
}

// ===== DEMO режим (mock данные) =====

const DEMO_BALANCES: BinanceBalance[] = [
  {
    asset: "USDT",
    walletBalance: 12500.42,
    availableBalance: 11800.42,
    marginBalance: 700.0,
    maxWithdrawAmount: 11800.42,
    crossWalletBalance: 12500.42,
  },
  {
    asset: "BNB",
    walletBalance: 12.45,
    availableBalance: 12.45,
    marginBalance: 0,
    maxWithdrawAmount: 12.45,
    crossWalletBalance: 0,
  },
];

const DEMO_PRICES: Record<string, number> = {
  BTCUSDT: 67850.5,
  ETHUSDT: 3285.4,
  SOLUSDT: 178.23,
  BNBUSDT: 612.8,
  USUSDT: 0.02118,
  PEPEUSDT: 0.0000098,
  DOGEUSDT: 0.1342,
  XRPUSDT: 0.5671,
  ADAUSDT: 0.4123,
  AVAXUSDT: 32.45,
  ARBUSDT: 0.8521,
  SUIUSDT: 1.8234,
  APTUSDT: 8.512,
  OPUSDT: 1.952,
  INJUSDT: 23.51,
  TIAUSDT: 6.234,
};

const DEMO_SYMBOLS = Object.keys(DEMO_PRICES).map((symbol) => ({
  symbol,
  status: "TRADING",
  baseAsset: symbol.replace("USDT", ""),
  quoteAsset: "USDT",
  pricePrecision: 4,
  quantityPrecision: 0,
  minQty: 1,
  stepSize: 1,
  tickSize: 0.0001,
}));

function demoPrice(symbol: string): number {
  if (DEMO_PRICES[symbol]) {
    // добавим лёгкий шум для динамики
    const base = DEMO_PRICES[symbol];
    const noise = (Math.random() - 0.5) * base * 0.005;
    return base + noise;
  }
  // неизвестный символ — сгенерируем правдоподобную цену
  return 0.001 + Math.random() * 10;
}

// ===== Публичные методы (без подписи) =====

export async function getSymbolInfo(symbol: string): Promise<BinanceSymbolInfo | null> {
  if (!isBinanceConfigured()) {
    return DEMO_SYMBOLS.find((s) => s.symbol === symbol.toUpperCase()) || null;
  }
  try {
    const symbolsMap = await cached("binance:exchangeInfo", 5 * 60_000, async () => {
      const data = await binanceRequest<{ symbols: any[] }>("/fapi/v1/exchangeInfo");
      const map = new Map<string, any>();
      for (const s of data.symbols) {
        map.set(s.symbol, s);
      }
      return map;
    });
    const found = symbolsMap.get(symbol.toUpperCase());
    if (!found) return null;
    const priceFilter = found.filters?.find((f: any) => f.filterType === "PRICE_FILTER");
    const lotSize = found.filters?.find((f: any) => f.filterType === "LOT_SIZE");
    return {
      symbol: found.symbol,
      status: found.status,
      baseAsset: found.baseAsset,
      quoteAsset: found.quoteAsset,
      pricePrecision: found.pricePrecision,
      quantityPrecision: found.quantityPrecision,
      minQty: parseFloat(lotSize?.minQty || "1"),
      stepSize: parseFloat(lotSize?.stepSize || "1"),
      tickSize: parseFloat(priceFilter?.tickSize || "0.0001"),
    };
  } catch (e) {
    console.error("[binance] getSymbolInfo error:", e);
    return null;
  }
}

export async function getTickerPrice(symbol: string): Promise<BinanceTickerPrice> {
  if (!isBinanceConfigured()) {
    return { symbol, price: demoPrice(symbol), time: Date.now() };
  }
  return cached(`binance:ticker:${symbol.toUpperCase()}`, 5_000, async () => {
    const data = await binanceRequest<{ symbol: string; price: string; time: number }>(
      "/fapi/v1/ticker/price",
      { symbol }
    );
    return { symbol: data.symbol, price: parseFloat(data.price), time: data.time };
  });
}

// ===== Авторизованные методы (с подписью) =====

export async function getAccountBalance(): Promise<BinanceBalance[]> {
  if (!isBinanceConfigured()) {
    // в демо: лёгкое случайное колебание
    return DEMO_BALANCES.map((b) => ({
      ...b,
      walletBalance: b.walletBalance + (Math.random() - 0.5) * 50,
      availableBalance: b.availableBalance + (Math.random() - 0.5) * 50,
    }));
  }
  return cached("binance:balance", 15_000, async () => {
    const data = await binanceRequest<any[]>("/fapi/v2/balance", {}, "GET", true);
    return data
      .map((d) => ({
        asset: d.asset,
        walletBalance: d.walletBalance !== null ? parseFloat(d.walletBalance) : 0,
        availableBalance: d.availableBalance !== null ? parseFloat(d.availableBalance) : 0,
        marginBalance: d.marginBalance !== null ? parseFloat(d.marginBalance) : 0,
        maxWithdrawAmount: d.maxWithdrawAmount !== null ? parseFloat(d.maxWithdrawAmount) : 0,
        crossWalletBalance: d.crossWalletBalance !== null ? parseFloat(d.crossWalletBalance) : 0,
      }))
      .filter((b) => b.walletBalance > 0 || b.availableBalance > 0 || b.marginBalance > 0);
  });
}

export async function getPositions(): Promise<BinancePosition[]> {
  if (!isBinanceConfigured()) {
    // вернём случайные открытые позиции для демо
    const demoSymbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT"];
    return demoSymbols.map((symbol) => {
      const price = demoPrice(symbol);
      const qty = (Math.random() > 0.5 ? 1 : -1) * (0.05 + Math.random() * 0.3);
      const entry = price * (1 + (Math.random() - 0.5) * 0.02);
      const uPnL = (price - entry) * qty;
      return {
        symbol,
        positionAmt: qty,
        entryPrice: entry,
        markPrice: price,
        unRealizedProfit: uPnL,
        liquidationPrice: entry * (1 - 0.05),
        leverage: 20,
        maxNotionalValue: Math.abs(entry * qty),
        positionSide: "BOTH",
      };
    });
  }
  return cached("binance:positions", 10_000, async () => {
    const data = await binanceRequest<any[]>("/fapi/v2/positionRisk", {}, "GET", true);
    return data
      .filter((d) => parseFloat(d.positionAmt) !== 0)
      .map((d) => ({
        symbol: d.symbol,
        positionAmt: parseFloat(d.positionAmt),
        entryPrice: parseFloat(d.entryPrice),
        markPrice: parseFloat(d.markPrice),
        unRealizedProfit: parseFloat(d.unRealizedProfit),
        liquidationPrice: parseFloat(d.liquidationPrice),
        leverage: parseInt(d.leverage, 10),
        maxNotionalValue: parseFloat(d.maxNotionalValue),
        positionSide: d.positionSide,
      }));
  });
}

export async function setLeverage(symbol: string, leverage: number): Promise<any> {
  if (!isBinanceConfigured()) {
    return { symbol, leverage, maxNotionalValue: leverage * 1000 };
  }
  return binanceRequest("/fapi/v1/leverage", { symbol, leverage }, "POST", true);
}

export async function placeMarketOrder(params: {
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  clientOrderId?: string;
  reduceOnly?: boolean;
}): Promise<BinanceOrderResponse> {
  if (!isBinanceConfigured()) {
    return {
      orderId: `DEMO_${Date.now()}`,
      symbol: params.symbol,
      status: "FILLED",
      side: params.side,
      type: "MARKET",
      origQty: String(params.quantity),
      avgPrice: String(demoPrice(params.symbol)),
      executedQty: String(params.quantity),
      cumQuote: String(params.quantity * demoPrice(params.symbol)),
      clientOrderId: params.clientOrderId || `DEMO_${Date.now()}`,
      closePosition: false,
    };
  }
  const body: Record<string, string | number | boolean | undefined> = {
    symbol: params.symbol,
    side: params.side,
    type: "MARKET",
    quantity: params.quantity,
    newClientOrderId: params.clientOrderId,
    reduceOnly: params.reduceOnly === true ? "true" : undefined,
  };
  return binanceRequest<BinanceOrderResponse>("/fapi/v1/order", body, "POST", true);
}

export async function closePosition(symbol: string, side: "BUY" | "SELL"): Promise<BinanceOrderResponse> {
  // закрытие всей позиции через reduceOnly MARKET ордер
  const positions = await getPositions();
  const pos = positions.find((p) => p.symbol === symbol);
  if (!pos || pos.positionAmt === 0) {
    throw new Error(`Нет открытой позиции по ${symbol}`);
  }
  const closeSide: "BUY" | "SELL" = side === "BUY" ? "SELL" : "BUY";
  const quantity = Math.abs(pos.positionAmt);
  return placeMarketOrder({
    symbol,
    side: closeSide,
    quantity,
    reduceOnly: true,
    clientOrderId: `CLOSE_${Date.now()}`,
  });
}

export async function testConnectivity(): Promise<{ ok: boolean; testnet: boolean; demo: boolean; latencyMs?: number; error?: string }> {
  return cached("binance:ping", 30_000, async () => {
    const start = Date.now();
    try {
      if (!isBinanceConfigured()) {
        return { ok: true, testnet: false, demo: true, latencyMs: Date.now() - start };
      }
      await binanceRequest("/fapi/v1/ping");
      return { ok: true, testnet: process.env.BINANCE_TESTNET === "true", demo: false, latencyMs: Date.now() - start };
    } catch (e: any) {
      return { ok: false, testnet: false, demo: false, error: e.message };
    }
  });
}
