/**
 * Заполнение Turso БД демо-данными (50 сделок, 30 сигналов, 8 логов).
 * Запуск:
 *   unset DATABASE_URL && bun run scripts/seed-turso.ts
 *
 * ВАЖНО: сначала запусти scripts/turso-migrate.ts, чтобы создать схему!
 */

import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";

dotenv.config({ path: "/home/z/my-project/.env", override: true });

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const SAMPLE_SYMBOLS = [
  "BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT", "DOGEUSDT",
  "ADAUSDT", "AVAXUSDT", "ARBUSDT", "SUIUSDT", "OPUSDT", "INJUSDT",
  "TIAUSDT", "APTUSDT", "PEPEUSDT", "USUSDT"
];

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

function cuid(): string {
  return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
}

async function insertTrade(data: any) {
  const now = new Date().toISOString();
  await client.execute({
    sql: `INSERT INTO Trade (id, symbol, side, leverage, positionSizeUsd, quantity, entryPrice, takeProfitPrice, stopLossPrice, exitPrice, pnlUsd, pnlPct, status, closeReason, openedAt, closedAt, updatedAt, isDemo, signalId)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      cuid(),
      data.symbol,
      data.side,
      data.leverage,
      data.positionSizeUsd,
      data.quantity,
      data.entryPrice,
      data.takeProfitPrice,
      data.stopLossPrice,
      data.exitPrice ?? null,
      data.pnlUsd ?? null,
      data.pnlPct ?? null,
      data.status,
      data.closeReason ?? null,
      data.openedAt,
      data.closedAt ?? null,
      now,
      data.isDemo ? 1 : 0,
      null,
    ],
  });
}

async function insertSignal(data: any) {
  const now = new Date().toISOString();
  await client.execute({
    sql: `INSERT INTO Signal (id, telegramId, channelName, rawText, symbol, baseAsset, priceAtSignal, priceChangePct, volumeChangePct, isPumpSignal, detectedAt, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      cuid(),
      data.telegramId,
      data.channelName,
      data.rawText,
      data.symbol,
      data.baseAsset,
      data.priceAtSignal,
      data.priceChangePct,
      data.volumeChangePct,
      data.isPumpSignal ? 1 : 0,
      data.detectedAt,
      now,
    ],
  });
}

async function insertSetting(key: string, value: string) {
  await client.execute({
    sql: `INSERT INTO Setting (key, value, updatedAt) VALUES (?, ?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = excluded.updatedAt`,
    args: [key, value, new Date().toISOString()],
  });
}

async function insertLog(level: string, category: string, message: string, meta?: string) {
  await client.execute({
    sql: `INSERT INTO Log (id, level, category, message, meta, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
    args: [cuid(), level, category, message, meta ?? null, new Date().toISOString()],
  });
}

async function main() {
  console.log("=".repeat(60));
  console.log("🌱 Заполнение Turso БД демо-данными...");
  console.log("=".repeat(60));

  // Очистим старые данные (если есть)
  console.log("\n🧹 Очистка старых данных...");
  await client.execute("DELETE FROM Trade");
  await client.execute("DELETE FROM Signal");
  await client.execute("DELETE FROM Setting");
  await client.execute("DELETE FROM Log");

  // Настройки
  console.log("\n⚙️  Настройки по умолчанию...");
  const settings: [string, string][] = [
    ["leverage", "75"],
    ["positionSizePct", "5"],
    ["takeProfitPct", "10"],
    ["stopLossPct", "5"],
    ["tradingEnabled", "false"],
    ["telegramChannel", "cryptoalr"],
    ["pollIntervalSec", "20"],
    ["checkIntervalSec", "5"],
  ];
  for (const [k, v] of settings) {
    await insertSetting(k, v);
  }
  console.log(`   ✅ ${settings.length} настроек`);

  // 50 закрытых сделок за последние 30 дней
  console.log("\n📊 Создаю 50 закрытых сделок...");
  const total = 50;
  for (let i = total; i >= 1; i--) {
    const symbol = pickSymbol(i);
    const entry = randomEntry(symbol);
    const leverage = 50 + Math.round(Math.random() * 50);
    const marginUsd = 50 + Math.random() * 200;
    const qty = (marginUsd * leverage) / entry;

    const isWin = Math.random() < 0.62;
    const movePct = isWin ? 5 + Math.random() * 8 : -(2 + Math.random() * 3);
    const exit = entry * (1 + movePct / 100);
    const pnlUsd = (exit - entry) * qty;
    const pnlPct = movePct;

    const daysAgo = Math.floor((total - i) / 2);
    const openedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - Math.random() * 6 * 60 * 60 * 1000);
    const closedAt = new Date(openedAt.getTime() + 60 * 1000 + Math.random() * 30 * 60 * 1000);
    const reason = isWin ? "TAKE_PROFIT" : "STOP_LOSS";

    await insertTrade({
      symbol, side: "BUY", leverage, positionSizeUsd: marginUsd,
      quantity: qty, entryPrice: entry,
      takeProfitPrice: entry * 1.1, stopLossPrice: entry * 0.95,
      exitPrice: exit, pnlUsd: Number(pnlUsd.toFixed(4)),
      pnlPct: Number(pnlPct.toFixed(2)),
      status: "CLOSED", closeReason: reason,
      openedAt: openedAt.toISOString(), closedAt: closedAt.toISOString(),
      isDemo: true,
    });
  }
  console.log(`   ✅ 50 закрытых сделок`);

  // 5 открытых сделок
  console.log("\n📈 Создаю 5 открытых сделок...");
  for (let i = 0; i < 5; i++) {
    const symbol = SAMPLE_SYMBOLS[i];
    const entry = randomEntry(symbol);
    const leverage = 75;
    const marginUsd = 50 + Math.random() * 100;
    const qty = (marginUsd * leverage) / entry;
    const openedAt = new Date(Date.now() - (i + 1) * 30 * 60 * 1000);

    await insertTrade({
      symbol, side: "BUY", leverage, positionSizeUsd: marginUsd,
      quantity: qty, entryPrice: entry,
      takeProfitPrice: entry * 1.1, stopLossPrice: entry * 0.95,
      status: "OPEN", openedAt: openedAt.toISOString(),
      isDemo: true,
    });
  }
  console.log(`   ✅ 5 открытых сделок`);

  // 30 сигналов за последние 7 дней
  console.log("\n🚀 Создаю 30 сигналов...");
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

    await insertSignal({
      telegramId: 1000 + i,
      channelName: "cryptoalr",
      rawText: text,
      symbol: isPump ? symbol : null,
      baseAsset: isPump ? baseAsset : null,
      priceAtSignal: isPump ? price : null,
      priceChangePct: isPump ? priceChangePct : null,
      volumeChangePct: isPump ? volumeChangePct : null,
      isPumpSignal: isPump,
      detectedAt: detectedAt.toISOString(),
    });
  }
  console.log(`   ✅ 30 сигналов`);

  // Логи
  console.log("\n📝 Создаю логи...");
  const logs: [string, string, string, string?][] = [
    ["INFO", "WORKER", "Worker started", null],
    ["INFO", "TELEGRAM", "Channel cryptoalr monitoring started", JSON.stringify({ channel: "cryptoalr" })],
    ["INFO", "BINANCE", "Binance API connection: LIVE mode", null],
    ["WARN", "WORKER", "Trading is disabled — signals will be logged but not executed", null],
    ["INFO", "TRADE", "Trade opened: BTCUSDT qty=0.00124 @ 67850.50", JSON.stringify({ tradeId: "demo", isDemo: false })],
    ["INFO", "TRADE", "Trade closed: BTCUSDT reason=TAKE_PROFIT pnl=+12.34 USDT (+8.5%)", null],
    ["ERROR", "BINANCE", "Rate limit warning: 1200 weight used in 1 minute", null],
    ["INFO", "WORKER", "Last poll: parsed 20 msgs, 1 new signal", null],
  ];
  for (const [level, category, message, meta] of logs) {
    await insertLog(level, category, message, meta);
  }
  console.log(`   ✅ ${logs.length} логов`);

  // Подсчёт
  console.log("\n" + "=".repeat(60));
  console.log("📊 Финальная статистика:");
  for (const table of ["Signal", "Trade", "Setting", "Log"]) {
    const count = await client.execute(`SELECT COUNT(*) as cnt FROM ${table}`);
    console.log(`   ${table}: ${count.rows[0].cnt} строк`);
  }
  console.log("=".repeat(60));
}

main()
  .catch((e) => {
    console.error("Критическая ошибка:", e);
    process.exit(1);
  })
  .finally(async () => {
    await client.close();
  });
