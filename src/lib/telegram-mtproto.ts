/**
 * Telegram MTProto клиент через GramJS.
 * Позволяет читать ЛЮБЫЕ каналы, где состоит твой аккаунт (включая @cryptoalr).
 *
 * Требует:
 *  - TELEGRAM_API_ID (получить на https://my.telegram.org → API development tools)
 *  - TELEGRAM_API_HASH
 *  - TELEGRAM_SESSION (StringSession — генерируется один раз через scripts/telegram-login.ts)
 *
 * Документация: https://gram.js.org/
 */

import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { Api } from "telegram";

let clientInstance: TelegramClient | null = null;
let clientReady = false;

export function isTelegramConfigured(): boolean {
  return Boolean(
    process.env.TELEGRAM_API_ID &&
      process.env.TELEGRAM_API_HASH &&
      process.env.TELEGRAM_SESSION
  );
}

export function getTelegramMethod(): "mtproto" | "scrape" {
  const m = process.env.TELEGRAM_METHOD || "mtproto";
  if (m === "scrape" || m === "mtproto") return m;
  return "mtproto";
}

/**
 * Инициализирует и подключает Telegram client (один раз).
 * Возвращает singleton instance.
 */
export async function getTelegramClient(): Promise<TelegramClient | null> {
  if (!isTelegramConfigured()) return null;
  if (clientInstance && clientReady) return clientInstance;

  const apiId = parseInt(process.env.TELEGRAM_API_ID!, 10);
  const apiHash = process.env.TELEGRAM_API_HASH!;
  const sessionString = process.env.TELEGRAM_SESSION!;

  const session = new StringSession(sessionString);
  const client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
    useWSS: true,
  });

  try {
    await client.connect();
    clientInstance = client;
    clientReady = true;
    console.log("[telegram] MTProto client connected");
    return client;
  } catch (e: any) {
    console.error("[telegram] MTProto connect failed:", e.message);
    clientReady = false;
    return null;
  }
}

export interface MTProtoMessage {
  id: number;
  channelName: string;
  text: string;
  url: string;
  datetime: string | null;
  timestamp: number | null;
  views: number | null;
}

/**
 * Получает последние сообщения из канала.
 * @param channelName — username без @ (например, "cryptoalr")
 * @param limit — макс. количество сообщений (до 100)
 */
export async function fetchChannelMessagesMTProto(
  channelName: string,
  limit = 20
): Promise<MTProtoMessage[]> {
  const client = await getTelegramClient();
  if (!client) {
    throw new Error("Telegram MTProto client not configured");
  }

  // 1. Резолвим username → Entity
  const entity = await client.getEntity(channelName);

  // 2. Запрашиваем последние N сообщений (включая текст, дату, просмотры)
  const messages = await client.getMessages(entity, { limit });

  // 3. Получаем ID канала для построения URL
  let channelId: string | null = null;
  if (entity instanceof Api.Channel) {
    channelId = String(entity.id);
  } else if (entity instanceof Api.Chat) {
    channelId = String(entity.id);
  }

  return messages
    .filter((m: any) => m && m.message) // пропускаем сервисные сообщения без текста
    .map((m: any) => {
      const text = m.message || "";
      const id = Number(m.id);
      const url =
        channelId !== null
          ? `https://t.me/c/${channelId}/${id}`
          : `https://t.me/${channelName}/${id}`;
      const date = m.date ? new Date(m.date * 1000) : null;
      return {
        id,
        channelName,
        text,
        url,
        datetime: date ? date.toISOString() : null,
        timestamp: date ? date.getTime() : null,
        views: m.views ? Number(m.views) : null,
      };
    });
}

/**
 * Получает только сообщения, начиная с указанного ID.
 * Используется worker'ом для инкрементального обновления.
 */
export async function fetchNewMessagesMTProto(
  channelName: string,
  afterMessageId: number,
  limit = 50
): Promise<MTProtoMessage[]> {
  const client = await getTelegramClient();
  if (!client) {
    throw new Error("Telegram MTProto client not configured");
  }

  const entity = await client.getEntity(channelName);

  // minId — получить сообщения с id > afterMessageId
  const messages = await client.getMessages(entity, {
    limit,
    minId: afterMessageId,
  });

  let channelId: string | null = null;
  if (entity instanceof Api.Channel) {
    channelId = String(entity.id);
  } else if (entity instanceof Api.Chat) {
    channelId = String(entity.id);
  }

  return messages
    .filter((m: any) => m && m.message)
    .map((m: any) => {
      const text = m.message || "";
      const id = Number(m.id);
      const url =
        channelId !== null
          ? `https://t.me/c/${channelId}/${id}`
          : `https://t.me/${channelName}/${id}`;
      const date = m.date ? new Date(m.date * 1000) : null;
      return {
        id,
        channelName,
        text,
        url,
        datetime: date ? date.toISOString() : null,
        timestamp: date ? date.getTime() : null,
        views: m.views ? Number(m.views) : null,
      };
    })
    .sort((a, b) => a.id - b.id);
}

/**
 * Тест подключения: возвращает基本信息 о текущем аккаунте.
 */
export async function testTelegramConnection(): Promise<{
  ok: boolean;
  configured: boolean;
  method: string;
  me?: { id: string; firstName: string; lastName?: string; username?: string };
  error?: string;
}> {
  if (!isTelegramConfigured()) {
    return { ok: false, configured: false, method: getTelegramMethod() };
  }
  try {
    const client = await getTelegramClient();
    if (!client) {
      return { ok: false, configured: true, method: "mtproto", error: "Client init failed" };
    }
    const me = await client.getMe();
    return {
      ok: true,
      configured: true,
      method: "mtproto",
      me: {
        id: String((me as any).id),
        firstName: (me as any).firstName || "",
        lastName: (me as any).lastName,
        username: (me as any).username,
      },
    };
  } catch (e: any) {
    return { ok: false, configured: true, method: "mtproto", error: e.message };
  }
}
