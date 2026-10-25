import { NextResponse } from "next/server";
import { isBinanceConfigured, testConnectivity } from "@/lib/binance";
import { isTelegramConfigured, getTelegramMethod, testTelegramConnection } from "@/lib/telegram";
import { db, isDbAvailable, getDbError } from "@/lib/db";

/**
 * GET /api/health
 * Возвращает live-статус всех компонентов проекта:
 *  - Binance API (подключение + работает ли)
 *  - Telegram MTProto (настроен ли)
 *  - База данных (Turso/local SQLite)
 *  - Worker (запущен ли)
 *  - Текущая торговля (включена ли)
 *  - Количество записей в БД
 *
 * Используется страницей /map для интерактивной mind map.
 */
export async function GET() {
  const checks: any = {
    timestamp: new Date().toISOString(),
    components: {},
    checklist: [],
  };

  // 1. BINANCE
  try {
    const binanceConfigured = isBinanceConfigured();
    const connectivity = await testConnectivity();
    checks.components.binance = {
      label: "Binance API (USDT-M Futures)",
      configured: binanceConfigured,
      mode: !binanceConfigured ? "DEMO" : process.env.BINANCE_TESTNET === "true" ? "TESTNET" : "LIVE",
      connected: connectivity.ok,
      latencyMs: connectivity.latencyMs,
      error: connectivity.error,
      status: !binanceConfigured
        ? "warning"
        : connectivity.ok
        ? "ok"
        : connectivity.error?.includes("banned")
        ? "banned"
        : "error",
      statusLabel: !binanceConfigured
        ? "Не настроено (DEMO)"
        : connectivity.ok
        ? `Подключено (${connectivity.latencyMs}ms)`
        : connectivity.error?.includes("banned")
        ? "IP заблокирован Binance"
        : `Ошибка: ${connectivity.error}`,
    };
  } catch (e: any) {
    checks.components.binance = { status: "error", error: e.message };
  }

  // 2. TELEGRAM
  try {
    const telegramConfigured = isTelegramConfigured();
    const method = getTelegramMethod();
    let connection: any = { ok: false, configured: telegramConfigured };
    if (telegramConfigured && method === "mtproto") {
      connection = await testTelegramConnection();
    }
    checks.components.telegram = {
      label: "Telegram MTProto",
      configured: telegramConfigured,
      method,
      connected: connection.ok,
      me: connection.me || null,
      error: connection.error,
      status: !telegramConfigured
        ? "warning"
        : connection.ok
        ? "ok"
        : "error",
      statusLabel: !telegramConfigured
        ? `Не настроено (метод: ${method})`
        : connection.ok
        ? `Подключено как ${connection.me?.firstName || "user"}`
        : `Ошибка: ${connection.error}`,
    };
  } catch (e: any) {
    checks.components.telegram = { status: "error", error: e.message };
  }

  // 3. DATABASE
  try {
    const databaseUrl = process.env.DATABASE_URL || "";
    const isTurso = databaseUrl.startsWith("libsql://") || databaseUrl.startsWith("libsqls://");

    // Сначала проверяем — доступен ли клиент БД вообще
    const dbAvailable = isDbAvailable();
    let signalCount = 0,
      tradeCount = 0,
      settingCount = 0,
      logCount = 0;
    let dbConnected = false;
    let dbError = dbAvailable ? null : getDbError();

    if (dbAvailable) {
      try {
        tradeCount = await db.trade.count();
        signalCount = await db.signal.count();
        settingCount = await db.setting.count();
        logCount = await db.log.count();
        dbConnected = true;
      } catch (e: any) {
        dbError = e.message;
      }
    }

    checks.components.database = {
      label: isTurso ? "Turso (libSQL)" : "Local SQLite",
      type: isTurso ? "turso" : "sqlite",
      url: databaseUrl ? `${databaseUrl.slice(0, 30)}...` : "(не задан)",
      connected: dbConnected,
      error: dbError,
      counts: { trades: tradeCount, signals: signalCount, settings: settingCount, logs: logCount },
      status: dbConnected ? "ok" : databaseUrl ? "error" : "warning",
      statusLabel: dbConnected
        ? `${isTurso ? "Turso" : "SQLite"} подключен (${tradeCount} trades, ${signalCount} signals)`
        : !databaseUrl
        ? "DATABASE_URL не задан (нужно добавить в Vercel env vars)"
        : `Ошибка: ${dbError}`,
    };
  } catch (e: any) {
    checks.components.database = { status: "error", error: e.message };
  }

  // 4. WORKER
  checks.components.worker = {
    label: "Background Worker",
    pollIntervalSec: parseInt(process.env.WORKER_POLL_INTERVAL_SEC || "20", 10),
    checkIntervalSec: parseInt(process.env.WORKER_CHECK_INTERVAL_SEC || "5", 10),
    status: "ok",
    statusLabel: "Готов к запуску (нажми Start в UI)",
  };

  // 5. TRADING
  try {
    let tradingEnabled = process.env.TRADING_ENABLED === "true";
    try {
      const setting = await db.setting.findUnique({ where: { key: "tradingEnabled" } });
      if (setting) tradingEnabled = setting.value === "true";
    } catch {}
    checks.components.trading = {
      label: "Auto Trading",
      enabled: tradingEnabled,
      leverage: parseInt(process.env.DEFAULT_LEVERAGE || "75", 10),
      positionSizePct: parseFloat(process.env.DEFAULT_POSITION_SIZE_PCT || "5"),
      takeProfitPct: parseFloat(process.env.DEFAULT_TAKE_PROFIT_PCT || "10"),
      stopLossPct: parseFloat(process.env.DEFAULT_STOP_LOSS_PCT || "5"),
      status: tradingEnabled ? "ok" : "warning",
      statusLabel: tradingEnabled
        ? "Активна (сделки будут открываться)"
        : "Отключена (только мониторинг сигналов)",
    };
  } catch (e: any) {
    checks.components.trading = { status: "error", error: e.message };
  }

  // 6. Чек-лист — чего не хватает
  const checklist: { id: string; label: string; status: "done" | "pending" | "warning"; description: string; action?: string }[] = [];

  const isBanned = checks.components.binance?.error?.includes("banned");
  checklist.push({
    id: "binance-keys",
    label: "Binance API ключи",
    status: checks.components.binance?.configured ? "done" : "pending",
    description: "Добавить BINANCE_API_KEY и BINANCE_API_SECRET в .env",
    action: "https://www.binance.com/en/my/settings/api-management",
  });
  checklist.push({
    id: "binance-ip",
    label: "Binance IP-фильтр",
    status: isBanned ? "warning" : checks.components.binance?.connected ? "done" : "pending",
    description: isBanned
      ? "IP забанен. Добавь свой IP в Binance API или используй Vercel/VPS"
      : "Добавить свой IP в Binance API Restrictions",
    action: "https://www.binance.com/en/my/settings/api-management",
  });
  checklist.push({
    id: "binance-futures",
    label: "Binance Futures Trading permission",
    status: "pending",
    description: "Включить галочку 'Enable Futures' в настройках API ключа (после IP-фильтра)",
    action: "https://www.binance.com/en/my/settings/api-management",
  });
  checklist.push({
    id: "tg-api",
    label: "Telegram api_id и api_hash",
    status: checks.components.telegram?.configured ? "done" : "pending",
    description: "Получить на my.telegram.org → API development tools",
    action: "https://my.telegram.org",
  });
  checklist.push({
    id: "tg-session",
    label: "Telegram session string",
    status: checks.components.telegram?.configured ? "done" : "pending",
    description: "Запустить bun run scripts/telegram-login.ts и скопировать session в .env",
  });
  checklist.push({
    id: "db",
    label: "База данных",
    status: checks.components.database?.connected ? "done" : "pending",
    description: "DATABASE_URL + DATABASE_AUTH_TOKEN в .env (Turso)",
    action: "https://turso.tech",
  });
  checklist.push({
    id: "db-migrate",
    label: "Миграция БД",
    status: checks.components.database?.connected ? "done" : "pending",
    description: "Запустить bun run scripts/turso-migrate.ts",
  });
  checklist.push({
    id: "trading-on",
    label: "Включить торговлю",
    status: checks.components.trading?.enabled ? "done" : "pending",
    description: "Переключить toggle 'Торговля включена' в Settings UI",
  });
  checklist.push({
    id: "worker-start",
    label: "Запустить Worker (24/7)",
    status: "pending",
    description: "Нажать 'Start' в Worker UI (или задеплоить на Vercel/VPS)",
  });
  checklist.push({
    id: "push",
    label: "Push-уведомления",
    status: "pending",
    description: "Нажать кнопку 'Push' в Worker UI и разрешить в браузере",
  });

  checks.checklist = checklist;

  return NextResponse.json(checks);
}
