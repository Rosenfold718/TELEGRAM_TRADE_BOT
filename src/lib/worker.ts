/**
 * Background worker: опрашивает Telegram, парсит сигналы, открывает/закрывает сделки на Binance.
 *
 * Синглтон на стороне сервера, управляется через API endpoints:
 *  - POST /api/worker/start
 *  - POST /api/worker/stop
 *  - GET  /api/worker/status
 *
 * Внимание: при рестарте Next.js dev server worker сбрасывается.
 * Для production деплоя на Vercel — worker нужно вынести в отдельный сервис (mini-service).
 */

import { db } from "@/lib/db";
import { fetchChannelMessages, getNewMessages } from "@/lib/telegram";
import { parseSignal, isTradingSignal } from "@/lib/parser";
import {
  getAccountBalance,
  getSymbolInfo,
  getTickerPrice,
  placeMarketOrder,
  setLeverage,
  closePosition,
  isBinanceConfigured,
} from "@/lib/binance";
import { getSettings, AppSettings } from "@/lib/settings";

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

class WorkerEngine {
  private status: WorkerStatus = {
    running: false,
    startedAt: null,
    lastPollAt: null,
    lastPollStatus: null,
    lastPollMessage: null,
    lastSignalAt: null,
    lastSignalText: null,
    lastTradeAt: null,
    totalSignalsDetected: 0,
    totalTradesExecuted: 0,
    totalErrors: 0,
  };

  private pollTimer: NodeJS.Timeout | null = null;
  private checkTimer: NodeJS.Timeout | null = null;
  private lastCheckedSignalId: Record<string, number> = {};

  start() {
    if (this.status.running) return;
    this.status.running = true;
    this.status.startedAt = Date.now();
    console.log("[worker] started");
    this.pollOnce(); // первый poll сразу
    this.scheduleTimers();
  }

  stop() {
    this.status.running = false;
    this.status.startedAt = null;
    if (this.pollTimer) clearTimeout(this.pollTimer);
    if (this.checkTimer) clearTimeout(this.checkTimer);
    this.pollTimer = null;
    this.checkTimer = null;
    console.log("[worker] stopped");
  }

  getStatus(): WorkerStatus {
    return { ...this.status };
  }

  private async scheduleTimers() {
    if (!this.status.running) return;
    const settings = await getSettings();
    this.pollTimer = setTimeout(async () => {
      await this.pollOnce();
      if (this.status.running) this.scheduleTimers();
    }, Math.max(5, settings.pollIntervalSec) * 1000);
    this.checkTimer = setTimeout(async () => {
      await this.checkOpenPositions();
      if (this.status.running) this.scheduleCheck();
    }, Math.max(2, settings.checkIntervalSec) * 1000);
  }

  private async scheduleCheck() {
    if (!this.status.running) return;
    const settings = await getSettings();
    this.checkTimer = setTimeout(async () => {
      await this.checkOpenPositions();
      if (this.status.running) this.scheduleCheck();
    }, Math.max(2, settings.checkIntervalSec) * 1000);
  }

  private async pollOnce() {
    const settings = await getSettings();
    const channel = settings.telegramChannel;
    console.log(`[worker] polling t.me/s/${channel}`);

    try {
      const lastSignal = await db.signal.findFirst({
        where: { channelName: channel },
        orderBy: { telegramId: "desc" },
      });
      const lastId = lastSignal?.telegramId || 0;

      const messages = await fetchChannelMessages(channel, { limit: 30 });
      const newMessages = getNewMessages(messages, lastId);

      console.log(`[worker] got ${messages.length} msgs, ${newMessages.length} new`);

      for (const msg of newMessages) {
        await this.processMessage(msg, channel, settings);
      }

      this.status.lastPollAt = Date.now();
      this.status.lastPollStatus = "ok";
      this.status.lastPollMessage = `parsed ${messages.length} msgs, ${newMessages.length} new`;
    } catch (e: any) {
      console.error(`[worker] poll error:`, e);
      this.status.lastPollAt = Date.now();
      this.status.lastPollStatus = "error";
      this.status.lastPollMessage = e.message;
      this.status.totalErrors++;
      await logEvent("ERROR", "WORKER", `Telegram poll failed: ${e.message}`);
    }
  }

  private async processMessage(msg: any, channel: string, settings: AppSettings) {
    const parsed = parseSignal(msg.text);
    console.log(`[worker] msg ${msg.id}: symbol=${parsed.symbol}, pump=${parsed.isPumpSignal}`);

    const signal = await db.signal.create({
      data: {
        telegramId: msg.id,
        channelName: channel,
        rawText: msg.text,
        symbol: parsed.symbol,
        baseAsset: parsed.baseAsset,
        priceAtSignal: parsed.priceAtSignal,
        priceChangePct: parsed.priceChangePct,
        volumeChangePct: parsed.volumeChangePct,
        isPumpSignal: parsed.isPumpSignal,
        detectedAt: msg.timestamp ? new Date(msg.timestamp) : new Date(),
      },
    });

    if (!isTradingSignal(parsed) || !parsed.symbol) {
      return;
    }

    this.status.totalSignalsDetected++;
    this.status.lastSignalAt = Date.now();
    this.status.lastSignalText = `${parsed.symbol} @ ${parsed.priceAtSignal ?? "n/a"}`;
    await logEvent("INFO", "TELEGRAM", `Signal detected: ${parsed.symbol}`, {
      signalId: signal.id,
      url: msg.url,
    });

    // Если торговля выключена — только логируем
    if (!settings.tradingEnabled) {
      console.log(`[worker] trading disabled — skipping order for ${parsed.symbol}`);
      await logEvent("WARN", "WORKER", `Trading disabled — signal ${parsed.symbol} skipped`);
      return;
    }

    // Открываем сделку
    await this.openTrade(signal.id, parsed.symbol, settings);
  }

  private async openTrade(signalId: string, symbol: string, settings: AppSettings) {
    const isDemo = !isBinanceConfigured();

    try {
      // 1. Проверяем символ
      const symbolInfo = await getSymbolInfo(symbol);
      if (!symbolInfo || symbolInfo.status !== "TRADING") {
        throw new Error(`Symbol ${symbol} not found or not trading on Binance`);
      }

      // 2. Получаем текущую цену
      const ticker = await getTickerPrice(symbol);
      const entryPrice = ticker.price;

      // 3. Получаем баланс
      const balances = await getAccountBalance();
      const usdt = balances.find((b) => b.asset === "USDT");
      const availableUsdt = usdt?.availableBalance || 0;

      // 4. Считаем размер позиции (margin в USDT)
      const marginUsd = (availableUsdt * settings.positionSizePct) / 100;
      if (marginUsd < 10) {
        throw new Error(
          `Insufficient USDT balance: available ${availableUsdt.toFixed(2)}, need at least 10 USDT for position`
        );
      }

      // 5. Set leverage (только для реального API)
      if (!isDemo) {
        try {
          await setLeverage(symbol, settings.leverage);
        } catch (e) {
          console.warn(`[worker] setLeverage failed:`, e);
        }
      }

      // 6. Считаем quantity: margin * leverage / price, округляем по stepSize
      const notionalValue = marginUsd * settings.leverage;
      const rawQty = notionalValue / entryPrice;
      const qty = roundToStep(rawQty, symbolInfo.stepSize);

      if (qty < symbolInfo.minQty) {
        throw new Error(`Calculated qty ${qty} < minQty ${symbolInfo.minQty}`);
      }

      // 7. Считаем TP/SL цены (для LONG: TP выше, SL ниже)
      const tpPrice = entryPrice * (1 + settings.takeProfitPct / 100);
      const slPrice = entryPrice * (1 - settings.stopLossPct / 100);

      console.log(
        `[worker] opening trade: ${symbol} qty=${qty} entry=${entryPrice} TP=${tpPrice} SL=${slPrice}`
      );

      // 8. Открываем позицию (LONG — BUY)
      const clientOrderId = Math.floor(Date.now() / 1000) % 1000000000;
      const order = await placeMarketOrder({
        symbol,
        side: "BUY",
        quantity: qty,
        clientOrderId: `T${clientOrderId}`,
      });

      // 9. Сохраняем сделку в БД
      const trade = await db.trade.create({
        data: {
          signalId,
          binanceClientId: clientOrderId,
          binanceOrderId: order.orderId,
          binancePositionId: order.orderId,
          symbol,
          side: "BUY",
          leverage: settings.leverage,
          positionSizeUsd: marginUsd,
          quantity: qty,
          entryPrice,
          takeProfitPrice: tpPrice,
          stopLossPrice: slPrice,
          status: "OPEN",
          isDemo,
        },
      });

      this.status.totalTradesExecuted++;
      this.status.lastTradeAt = Date.now();
      await logEvent("INFO", "TRADE", `Trade opened: ${symbol} qty=${qty} @ ${entryPrice}`, {
        tradeId: trade.id,
        isDemo,
      });
    } catch (e: any) {
      console.error(`[worker] openTrade error for ${symbol}:`, e);
      this.status.totalErrors++;
      await logEvent("ERROR", "TRADE", `Failed to open ${symbol}: ${e.message}`, { signalId });
    }
  }

  private async checkOpenPositions() {
    if (!this.status.running) return;
    try {
      const openTrades = await db.trade.findMany({ where: { status: "OPEN" } });
      if (openTrades.length === 0) return;

      for (const trade of openTrades) {
        try {
          const ticker = await getTickerPrice(trade.symbol);
          const currentPrice = ticker.price;
          // LONG позиция: PnL = (current - entry) * qty
          const pnlUsd = (currentPrice - trade.entryPrice) * trade.quantity;
          const pnlPct = ((currentPrice - trade.entryPrice) / trade.entryPrice) * 100;

          // Проверяем TP (цена выросла на takeProfitPct %)
          if (currentPrice >= trade.takeProfitPrice) {
            await this.closeTradeManually(trade.id, "TAKE_PROFIT", currentPrice, pnlUsd, pnlPct);
            continue;
          }
          // Проверяем SL (цена упала на stopLossPct %)
          if (currentPrice <= trade.stopLossPrice) {
            await this.closeTradeManually(trade.id, "STOP_LOSS", currentPrice, pnlUsd, pnlPct);
            continue;
          }
        } catch (e: any) {
          console.error(`[worker] checkPosition ${trade.symbol} error:`, e);
        }
      }
    } catch (e: any) {
      console.error(`[worker] checkOpenPositions error:`, e);
      this.status.totalErrors++;
    }
  }

  async closeTradeManually(
    tradeId: string,
    reason: string,
    exitPrice?: number,
    pnlUsd?: number,
    pnlPct?: number
  ): Promise<void> {
    const trade = await db.trade.findUnique({ where: { id: tradeId } });
    if (!trade || trade.status !== "OPEN") return;

    let actualExitPrice = exitPrice;
    let actualPnlUsd = pnlUsd;
    let actualPnlPct = pnlPct;

    // Если цены не переданы — получим с биржи
    if (actualExitPrice === undefined) {
      const ticker = await getTickerPrice(trade.symbol);
      actualExitPrice = ticker.price;
      actualPnlPct = ((actualExitPrice - trade.entryPrice) / trade.entryPrice) * 100;
      actualPnlUsd = (actualExitPrice - trade.entryPrice) * trade.quantity;
    }

    // Реально закрываем на Binance (если не демо и ключи есть)
    if (!trade.isDemo && isBinanceConfigured()) {
      try {
        await closePosition(trade.symbol, trade.side as "BUY" | "SELL");
      } catch (e: any) {
        console.error(`[worker] closePosition error:`, e);
        await logEvent("ERROR", "TRADE", `Failed to close ${trade.symbol} on Binance: ${e.message}`, {
          tradeId,
        });
      }
    }

    await db.trade.update({
      where: { id: tradeId },
      data: {
        status: "CLOSED",
        closeReason: reason,
        exitPrice: actualExitPrice,
        pnlUsd: actualPnlUsd,
        pnlPct: actualPnlPct,
        closedAt: new Date(),
      },
    });

    await logEvent(
      "INFO",
      "TRADE",
      `Trade closed: ${trade.symbol} reason=${reason} pnl=${actualPnlUsd?.toFixed(2)} USDT (${actualPnlPct?.toFixed(2)}%)`,
      { tradeId, reason, pnlUsd: actualPnlUsd, pnlPct: actualPnlPct }
    );

    console.log(
      `[worker] closed ${trade.symbol} reason=${reason} pnl=${actualPnlUsd?.toFixed(2)} USDT`
    );
  }

  /**
   * Закрыть все открытые позиции (Kill Switch).
   */
  async closeAllPositions(): Promise<{ closed: number }> {
    const openTrades = await db.trade.findMany({ where: { status: "OPEN" } });
    for (const t of openTrades) {
      await this.closeTradeManually(t.id, "MANUAL");
    }
    return { closed: openTrades.length };
  }
}

function roundToStep(value: number, step: number): number {
  if (step <= 0) return value;
  return Math.floor(value / step) * step;
}

async function logEvent(level: string, category: string, message: string, meta?: any) {
  try {
    await db.log.create({
      data: {
        level,
        category,
        message,
        meta: meta ? JSON.stringify(meta) : null,
      },
    });
  } catch (e) {
    console.error("[worker] log error:", e);
  }
}

// Синглтон
export const worker = new WorkerEngine();
