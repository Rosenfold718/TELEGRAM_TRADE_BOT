/**
 * Создание схемы в Turso (libSQL) напрямую через @libsql/client.
 *
 * Запуск:
 *   bun run scripts/turso-migrate.ts
 *
 * Этот скрипт создаёт все таблицы (Signal, Trade, Setting, Log) в Turso БД,
 * используя SQL напрямую (без Prisma migrate CLI, т.к. он не поддерживает libSQL:// URLs).
 */

import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";

// override: true чтобы перезаписать существующие env vars из shell
dotenv.config({ path: "/home/z/my-project/.env", override: true });

const databaseUrl = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;

if (!databaseUrl) {
  console.error("❌ DATABASE_URL не задан в .env");
  process.exit(1);
}

const client = createClient({
  url: databaseUrl,
  authToken: authToken || undefined,
});

const DDL_STATEMENTS = [
  // Signal
  `CREATE TABLE IF NOT EXISTS Signal (
    id TEXT PRIMARY KEY,
    telegramId INTEGER NOT NULL UNIQUE,
    channelName TEXT NOT NULL,
    rawText TEXT NOT NULL,
    symbol TEXT,
    baseAsset TEXT,
    priceAtSignal REAL,
    priceChangePct REAL,
    volumeChangePct REAL,
    isPumpSignal INTEGER NOT NULL DEFAULT 0,
    tradeId TEXT UNIQUE,
    detectedAt TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_signal_channel_tg ON Signal (channelName, telegramId)`,
  `CREATE INDEX IF NOT EXISTS idx_signal_detected ON Signal (detectedAt)`,

  // Trade
  `CREATE TABLE IF NOT EXISTS Trade (
    id TEXT PRIMARY KEY,
    signalId TEXT UNIQUE,
    binanceClientId INTEGER UNIQUE,
    binanceOrderId TEXT,
    binancePositionId TEXT,
    symbol TEXT NOT NULL,
    side TEXT NOT NULL,
    leverage INTEGER NOT NULL,
    positionSizeUsd REAL NOT NULL,
    quantity REAL NOT NULL,
    entryPrice REAL NOT NULL,
    takeProfitPrice REAL NOT NULL,
    stopLossPrice REAL NOT NULL,
    exitPrice REAL,
    pnlUsd REAL,
    pnlPct REAL,
    status TEXT NOT NULL DEFAULT 'OPEN',
    closeReason TEXT,
    openedAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    closedAt TEXT,
    updatedAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    errorMessage TEXT,
    isDemo INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (signalId) REFERENCES Signal(id) ON DELETE SET NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_trade_status ON Trade (status)`,
  `CREATE INDEX IF NOT EXISTS idx_trade_symbol ON Trade (symbol)`,
  `CREATE INDEX IF NOT EXISTS idx_trade_openedAt ON Trade (openedAt)`,

  // Setting
  `CREATE TABLE IF NOT EXISTS Setting (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updatedAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  )`,

  // Log
  `CREATE TABLE IF NOT EXISTS Log (
    id TEXT PRIMARY KEY,
    level TEXT NOT NULL,
    category TEXT NOT NULL,
    message TEXT NOT NULL,
    meta TEXT,
    createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_log_level_created ON Log (level, createdAt)`,
  `CREATE INDEX IF NOT EXISTS idx_log_category ON Log (category)`,
];

async function main() {
  console.log("=".repeat(60));
  console.log("🔄 Подключение к Turso:", databaseUrl);
  console.log("=".repeat(60));

  // Проверка соединения
  try {
    const ping = await client.execute("SELECT 1 as test");
    console.log("✅ Соединение установлено");
  } catch (e: any) {
    console.error("❌ Не удалось подключиться к Turso:", e.message);
    process.exit(1);
  }

  // Сначала удалим существующие таблицы (чтобы обновить DEFAULT значения)
  console.log("\n🧹 Удаляю старые таблицы...");
  const dropOrder = ["Trade", "Signal", "Setting", "Log"];
  for (const table of dropOrder) {
    try {
      await client.execute(`DROP TABLE IF EXISTS ${table}`);
      console.log(`   - ${table} удалена`);
    } catch (e: any) {
      console.log(`   - ${table}: ${e.message}`);
    }
  }

  // Выполняем DDL по очереди
  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (const stmt of DDL_STATEMENTS) {
    try {
      await client.execute(stmt);
      const isCreateTable = stmt.trim().toUpperCase().startsWith("CREATE TABLE");
      if (isCreateTable) {
        const tableName = stmt.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
        console.log(`✅ Таблица создана: ${tableName}`);
      } else {
        const indexName = stmt.match(/CREATE INDEX IF NOT EXISTS (\w+)/)?.[1];
        console.log(`✅ Индекс: ${indexName}`);
      }
      success++;
    } catch (e: any) {
      if (e.message.includes("already exists")) {
        console.log(`⏭️  Уже существует, пропускаю`);
        skipped++;
      } else {
        console.error(`❌ Ошибка: ${e.message}`);
        console.error(`   SQL: ${stmt.slice(0, 100)}...`);
        failed++;
      }
    }
  }

  console.log("=".repeat(60));
  console.log(`📊 Готово: ${success} успешно, ${skipped} пропущено, ${failed} ошибок`);
  console.log("=".repeat(60));

  // Покажем список таблиц
  const tables = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_%'"
  );
  console.log("\n📋 Таблицы в БД:");
  for (const row of tables.rows) {
    console.log(`   - ${row.name}`);
  }

  // Покажем количество строк в каждой таблице
  for (const row of tables.rows) {
    const tname = row.name as string;
    try {
      const count = await client.execute(`SELECT COUNT(*) as cnt FROM "${tname}"`);
      console.log(`   ${tname}: ${count.rows[0].cnt} строк`);
    } catch (e: any) {
      console.log(`   ${tname}: ошибка чтения (${e.message})`);
    }
  }
}

main()
  .catch((e) => {
    console.error("Критическая ошибка:", e);
    process.exit(1);
  })
  .finally(async () => {
    await client.close();
  });
