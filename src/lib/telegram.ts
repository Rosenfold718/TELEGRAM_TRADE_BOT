/**
 * Унифицированный интерфейс для получения сообщений из Telegram.
 * Поддерживает 2 метода (выбирается через TELEGRAM_METHOD):
 *   - "mtproto" — через User API (нужно TELEGRAM_API_ID + API_HASH + SESSION). Читает любые каналы.
 *   - "scrape"  — через t.me/s/<channel> (без авторизации, работает не для всех каналов)
 *
 * ВАЖНО: MTProto функции подгружаются динамически через import(),
 * чтобы GramJS не загружался при компиляции route handlers и worker
 * (иначе Next.js edge runtime может ломаться).
 */

import {
  fetchChannelMessages as scrapeFetchChannelMessages,
  filterNewMessages,
  TelegramMessage,
} from "@/lib/telegram-scrape";

export type { TelegramMessage };

export function getTelegramMethod(): "mtproto" | "scrape" {
  const m = process.env.TELEGRAM_METHOD || "mtproto";
  if (m === "scrape" || m === "mtproto") return m;
  return "mtproto";
}

export function isTelegramConfigured(): boolean {
  return Boolean(
    process.env.TELEGRAM_API_ID &&
      process.env.TELEGRAM_API_HASH &&
      process.env.TELEGRAM_SESSION
  );
}

/**
 * Получить последние сообщения из канала.
 * Автоматически выбирает метод (MTProto или web scraping).
 */
export async function fetchChannelMessages(
  channelName: string,
  options: { beforeId?: number; limit?: number } = {}
): Promise<TelegramMessage[]> {
  const method = getTelegramMethod();

  if (method === "mtproto" && isTelegramConfigured()) {
    try {
      // Динамический импорт — GramJS загружается только при реальном использовании
      const { fetchChannelMessagesMTProto } = await import("@/lib/telegram-mtproto");
      const msgs = await fetchChannelMessagesMTProto(channelName, options.limit || 20);
      return msgs as any;
    } catch (e: any) {
      console.error("[telegram] MTProto fetch failed, fallback to scrape:", e.message);
      return scrapeFetchChannelMessages(channelName, options);
    }
  }

  // default: web scraping
  return scrapeFetchChannelMessages(channelName, options);
}

/**
 * Возвращает только новые сообщения (id > lastKnownId).
 */
export function getNewMessages(
  messages: TelegramMessage[],
  lastKnownId: number
): TelegramMessage[] {
  return filterNewMessages(messages, lastKnownId);
}

/**
 * Тест соединения с Telegram (только для MTProto метода).
 */
export async function testTelegramConnection(): Promise<{
  ok: boolean;
  configured: boolean;
  method: string;
  me?: any;
  error?: string;
}> {
  const method = getTelegramMethod();
  const configured = isTelegramConfigured();

  if (!configured) {
    return { ok: false, configured: false, method };
  }

  try {
    const { testTelegramConnection: test } = await import("@/lib/telegram-mtproto");
    return await test();
  } catch (e: any) {
    return { ok: false, configured: true, method, error: e.message };
  }
}
