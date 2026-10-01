/**
 * Скрипт для заполнения БД демо-данными (сделки, сигналы, логи).
 * Запуск: bun run /home/z/my-project/scripts/seed-demo.ts
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const SAMPLE_SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT", "DOGEUSDT", "ADAUSDT", "AVAXUSDT", "ARBUSDT", "SUIUSDT", "OPUSDT", "INJUSDT", "TIAUSDT", "APTUSDT", "PEPEUSDT", "USUSDT"];

function pickSymbol(i: number): string {
  return SAMPLE_SYMBOLS[i % SAMPLE_SYMBOLS.length];
}

function randomEntry(symbol: string): number {
  if (symbol === "BTCUSDT") return 60000 + Math.random() * 8000;
  if (symbol === "ETHUSDT") return 3000 + Math.random() * 400;
  if (symbol === "SOLUSDT") return 150 + Math.random() * 30;
  if (symbol === "BNBUSDT") return 550 + Math.random() * 100;
  if (symbol === "XRPUSDT") return 0.5 + Math.random() * 0.1;
  if (symbol === "DOGEUSDT") return 0.12 + Math.random() * 0.02;
  if (symbol === "ADAUSDT") return 0.4 + Math.random() * 0.05;
  if (symbol === "AVAXUSDT") return 30 + Math.random() * 5;
  if (symbol === "ARBUSDT") return 0.8 + Math.random() * 0.1;
  if (symbol === "SUIUSDT") return 1.7 + Math.random() * 0.2;
  if (symbol === "OPUSDT") return 1.8 + Math.random() * 0.3;
  if (symbol === "INJUSDT") return 22 + Math.random() * 3;
  if (symbol === "TIAUSDT") return 6 + Math.random() * 0.5;
  if (symbol === "APTUSDT") return 8 + Math.random() * 1;
  if (symbol === "PEPEUSDT") return 0.0000095 + Math.random() * 0.0000005;
  if (symbol === "USUSDT") return 0.02118 + Math.random() * 0.0005;
  return 1 + Math.random();
}

async function main() {
  console.log("Seeding demo data...");

  // Создаём настройки по умолчанию
  const defaultSettings = {
    leverage: "75",
    positionSizePct: "5",
    takeProfitPct: "10",
    stopLossPct: "5",
    tradingEnabled: "false",
    telegramChannel: "cryptoalr",
    pollIntervalSec: "20",
    checkIntervalSec: "5",
  };
  for (const [k, v] of Object.entries(defaultSettings)) {
    await db.setting.upsert({ where: { key: k }, update: { value: v }, create: { key: k, value: v } });
  }
  console.log("Settings seeded.");

  // Создаём 50 закрытых сделок за последние 30 дней
  const total = 50;
  for (let i = total; i >= 1; i--) {
    const symbol = pickSymbol(i);
    const entry = randomEntry(symbol);
    const leverage = 50 + Math.round(Math.random() * 50);
    const marginUsd = 50 + Math.random() * 200;
    const qty = (marginUsd * leverage) / entry;

    // 62% win rate, TP=10% SL=5%
    const isWin = Math.random() < 0.62;
    const movePct = isWin ? 5 + Math.random() * 8 : -(2 + Math.random() * 3);
    const exit = entry * (1 + movePct / 100);
    const pnlUsd = (exit - entry) * qty;
    const pnlPct = movePct;

    const daysAgo = Math.floor((total - i) / 2);
    const openedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - Math.random() * 6 * 60 * 60 * 1000);
    const closedAt = new Date(openedAt.getTime() + 60 * 1000 + Math.random() * 30 * 60 * 1000);
    const reason = isWin ? "TAKE_PROFIT" : "STOP_LOSS";

    await db.trade.create({
      data: {
        symbol,
        side: "BUY",
        leverage,
        positionSizeUsd: marginUsd,
        quantity: qty,
        entryPrice: entry,
        takeProfitPrice: entry * 1.1,
        stopLossPrice: entry * 0.95,
        exitPrice: exit,
        pnlUsd: Number(pnlUsd.toFixed(4)),
        pnlPct: Number(pnlPct.toFixed(2)),
        status: "CLOSED",
        closeReason: reason,
        openedAt,
        closedAt,
        isDemo: true,
      },
    });
  }

  // 5 открытых сделок
  for (let i = 0; i < 5; i++) {
    const symbol = SAMPLE_SYMBOLS[i];
    const entry = randomEntry(symbol);
    const leverage = 75;
    const marginUsd = 50 + Math.random() * 100;
    const qty = (marginUsd * leverage) / entry;
    const openedAt = new Date(Date.now() - (i + 1) * 30 * 60 * 1000);

    await db.trade.create({
      data: {
        symbol,
        side: "BUY",
        leverage,
        positionSizeUsd: marginUsd,
        quantity: qty,
        entryPrice: entry,
        takeProfitPrice: entry * 1.1,
        stopLossPrice: entry * 0.95,
        status: "OPEN",
        openedAt,
        isDemo: true,
      },
    });
  }

  // 30 сигналов за последние 7 дней
  for (let i = 0; i < 30; i++) {
    const symbol = pickSymbol(i + 3);
    const baseAsset = symbol.replace("USDT", "");
    const price = randomEntry(symbol);
    const priceChangePct = 5 + Math.random() * 30;
    const volumeChangePct = 100 + Math.random() * 800;
    const isPump = i % 3 === 0;
    const detectedAt = new Date(Date.now() - i * 2 * 60 * 60 * 1000 - Math.random() * 30 * 60 * 1000);

    const text = isPump
      ? `🚀🤘 ${symbol} IS PUMPING 🤘🚀\n💲 We saw a price increase of +${(price * 0.01).toFixed(5)}📈 (+${priceChangePct.toFixed(1)}📈%)\n⚡ We also saw a volume increase of +${Math.round(Math.random() * 100000000)}📈 (+${volumeChangePct.toFixed(1)}📈%)\n🔥🔥🔥 CURRENT PRICE: ${price.toFixed(5)}. TIME TO TRADE!`
      : `Market update: ${symbol} showing ${priceChangePct.toFixed(1)}% change in last 24h`;

    await db.signal.create({
      data: {
        telegramId: 1000 + i,
        channelName: "cryptoalr",
        rawText: text,
        symbol: isPump ? symbol : null,
        baseAsset: isPump ? baseAsset : null,
        priceAtSignal: isPump ? price : null,
        priceChangePct: isPump ? priceChangePct : null,
        volumeChangePct: isPump ? volumeChangePct : null,
        isPumpSignal: isPump,
        detectedAt,
      },
    });
  }

  // Логи
  const logMessages: [string, string, string, any][] = [
    ["INFO", "WORKER", "Worker started", null],
    ["INFO", "TELEGRAM", "Channel cryptoalr monitoring started", { channel: "cryptoalr" }],
    ["INFO", "BINANCE", "Binance API connection: demo mode (no API keys configured)", null],
    ["WARN", "WORKER", "Trading is disabled — signals will be logged but not executed", null],
    ["INFO", "TRADE", "Trade opened: BTCUSDT qty=0.00124 @ 67850.50", { tradeId: "demo", isDemo: true }],
    ["INFO", "TRADE", "Trade closed: BTCUSDT reason=TAKE_PROFIT pnl=+12.34 USDT (+8.5%)", null],
    ["ERROR", "BINANCE", "Rate limit warning: 1200 weight used in 1 minute", null],
    ["INFO", "WORKER", "Last poll: parsed 20 msgs, 1 new signal", null],
  ];
  for (const [level, category, message, meta] of logMessages) {
    await db.log.create({
      data: { level, category, message, meta: meta ? JSON.stringify(meta) : null },
    });
  }

  const trades = await db.trade.count();
  const signals = await db.signal.count();
  const logs = await db.log.count();
  console.log(`Done. trades=${trades}, signals=${signals}, logs=${logs}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
