import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseSignal, isTradingSignal } from "@/lib/parser";
import { getSettings } from "@/lib/settings";
import {
  getAccountBalance,
  getSymbolInfo,
  getTickerPrice,
  placeMarketOrder,
  setLeverage,
  isBinanceConfigured,
} from "@/lib/binance";

/**
 * POST /api/test-signal
 * Body: { symbol?: "USUSDT", text?: "..." }
 *
 * Создаёт тестовый сигнал (как будто пришёл из Telegram),
 * парсит его и (если торговля включена) открывает демо-сделку.
 *
 * Используется, чтобы пользователь мог проверить всю цепочку
 * (парсинг -> Binance API -> БД) без ожидания реального сигнала.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const symbol = (body.symbol || "USUSDT").toUpperCase();
    const settings = await getSettings();
    const isDemo = !isBinanceConfigured();

    // Создаём текст сигнала в формате канала @cryptoalr
    const text =
      body.text ||
      `🚀🤘 ${symbol} IS PUMPING 🤘🚀
💲 We saw a price increase of +0.00197📈 (+10.3📈%)
⚡ We also saw a volume increase of +78223670📈 (+676.3📈%)
🔥🔥🔥 CURRENT PRICE: 0.02118. TIME TO TRADE!`;

    // Парсим
    const parsed = parseSignal(text);
    if (!isTradingSignal(parsed) || !parsed.symbol) {
      return NextResponse.json({ ok: false, error: "Parsed signal is not valid", parsed }, { status: 400 });
    }

    // Сохраняем сигнал в БД (с большим telegramId, чтобы не конфликтовать)
    const telegramId = Math.floor(Date.now() / 1000);
    const signal = await db.signal.create({
      data: {
        telegramId,
        channelName: "test",
        rawText: text,
        symbol: parsed.symbol,
        baseAsset: parsed.baseAsset,
        priceAtSignal: parsed.priceAtSignal,
        priceChangePct: parsed.priceChangePct,
        volumeChangePct: parsed.volumeChangePct,
        isPumpSignal: parsed.isPumpSignal,
        detectedAt: new Date(),
      },
    });

    if (!settings.tradingEnabled) {
      return NextResponse.json({
        ok: true,
        message: "Signal saved, but trading is disabled (enable in settings to execute)",
        signal,
        parsed,
      });
    }

    // Проверяем символ
    const symbolInfo = await getSymbolInfo(symbol);
    if (!symbolInfo || symbolInfo.status !== "TRADING") {
      return NextResponse.json({ ok: false, error: `Symbol ${symbol} not found on Binance`, signal }, { status: 400 });
    }

    // Цена входа
    const ticker = await getTickerPrice(symbol);
    const entryPrice = ticker.price;

    // Баланс
    const balances = await getAccountBalance();
    const usdt = balances.find((b) => b.asset === "USDT");
    const availableUsdt = usdt?.availableBalance || 0;

    // Размер позиции
    const marginUsd = (availableUsdt * settings.positionSizePct) / 100;
    if (marginUsd < 10) {
      return NextResponse.json({ ok: false, error: `Insufficient USDT balance: ${availableUsdt}`, signal }, { status: 400 });
    }

    // Set leverage
    if (!isDemo) {
      try {
        await setLeverage(symbol, settings.leverage);
      } catch (e) {
        console.warn("setLeverage failed:", e);
      }
    }

    const qty = Math.floor((marginUsd * settings.leverage) / entryPrice / symbolInfo.stepSize) * symbolInfo.stepSize;
    const tpPrice = entryPrice * (1 + settings.takeProfitPct / 100);
    const slPrice = entryPrice * (1 - settings.stopLossPct / 100);

    const clientOrderId = Math.floor(Date.now() / 1000) % 1000000000;
    const order = await placeMarketOrder({
      symbol,
      side: "BUY",
      quantity: qty,
      clientOrderId: `T${clientOrderId}`,
    });

    const trade = await db.trade.create({
      data: {
        signalId: signal.id,
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

    return NextResponse.json({
      ok: true,
      message: `Test signal processed — trade opened for ${symbol}`,
      signal,
      trade,
      parsed,
      order,
      isDemo,
    });
  } catch (e: any) {
    console.error("[test-signal] error:", e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
