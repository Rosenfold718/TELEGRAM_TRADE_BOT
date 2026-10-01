/**
 * Настройки приложения, хранятся в таблице Setting (key-value).
 */

import { db } from "@/lib/db";

export interface AppSettings {
  leverage: number;          // 75
  positionSizePct: number;   // 5 (% от available USDT)
  takeProfitPct: number;     // 10
  stopLossPct: number;       // 5 (положительное число, означает -5%)
  tradingEnabled: boolean;   // false = только мониторинг, без реальных ордеров
  telegramChannel: string;   // "cryptoalr"
  pollIntervalSec: number;   // 20
  checkIntervalSec: number;  // 5
}

export const DEFAULT_SETTINGS: AppSettings = {
  leverage: parseInt(process.env.DEFAULT_LEVERAGE || "75", 10),
  positionSizePct: parseFloat(process.env.DEFAULT_POSITION_SIZE_PCT || "5"),
  takeProfitPct: parseFloat(process.env.DEFAULT_TAKE_PROFIT_PCT || "10"),
  stopLossPct: parseFloat(process.env.DEFAULT_STOP_LOSS_PCT || "5"),
  tradingEnabled: process.env.TRADING_ENABLED === "true",
  telegramChannel: process.env.TELEGRAM_CHANNEL || "cryptoalr",
  pollIntervalSec: parseInt(process.env.WORKER_POLL_INTERVAL_SEC || "20", 10),
  checkIntervalSec: parseInt(process.env.WORKER_CHECK_INTERVAL_SEC || "5", 10),
};

export async function getSettings(): Promise<AppSettings> {
  const rows = await db.setting.findMany();
  const map = new Map(rows.map((r) => [r.key, r.value]));
  return {
    leverage: map.has("leverage") ? parseInt(map.get("leverage")!, 10) : DEFAULT_SETTINGS.leverage,
    positionSizePct: map.has("positionSizePct")
      ? parseFloat(map.get("positionSizePct")!)
      : DEFAULT_SETTINGS.positionSizePct,
    takeProfitPct: map.has("takeProfitPct")
      ? parseFloat(map.get("takeProfitPct")!)
      : DEFAULT_SETTINGS.takeProfitPct,
    stopLossPct: map.has("stopLossPct")
      ? parseFloat(map.get("stopLossPct")!)
      : DEFAULT_SETTINGS.stopLossPct,
    tradingEnabled: map.has("tradingEnabled")
      ? map.get("tradingEnabled") === "true"
      : DEFAULT_SETTINGS.tradingEnabled,
    telegramChannel: map.has("telegramChannel")
      ? map.get("telegramChannel")!
      : DEFAULT_SETTINGS.telegramChannel,
    pollIntervalSec: map.has("pollIntervalSec")
      ? parseInt(map.get("pollIntervalSec")!, 10)
      : DEFAULT_SETTINGS.pollIntervalSec,
    checkIntervalSec: map.has("checkIntervalSec")
      ? parseInt(map.get("checkIntervalSec")!, 10)
      : DEFAULT_SETTINGS.checkIntervalSec,
  };
}

export async function updateSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  for (const [key, value] of Object.entries(patch)) {
    const strVal = typeof value === "boolean" ? (value ? "true" : "false") : String(value);
    await db.setting.upsert({
      where: { key },
      update: { value: strVal },
      create: { key, value: strVal },
    });
  }
  return getSettings();
}
