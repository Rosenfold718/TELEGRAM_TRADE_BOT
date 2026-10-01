import { NextResponse } from "next/server";
import {
  isTelegramConfigured,
  getTelegramMethod,
  testTelegramConnection,
  fetchChannelMessages,
} from "@/lib/telegram";

/**
 * GET /api/telegram/status
 * Возвращает статус соединения с Telegram (MTProto или web scraping).
 *
 * Query params:
 *  - channel=<username> — канал для теста (по умолчанию из .env TELEGRAM_CHANNEL)
 *  - fetch=true — попробовать получить последние 5 сообщений
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const testChannel = searchParams.get("channel") || process.env.TELEGRAM_CHANNEL || "cryptoalr";
    const fetchTest = searchParams.get("fetch") === "true";

    const method = getTelegramMethod();
    const configured = isTelegramConfigured();

    let connection: any;
    let messagesCount: number | null = null;
    let sampleMessage: string | null = null;
    let fetchError: string | null = null;

    if (method === "mtproto" && configured) {
      connection = await testTelegramConnection();
    } else {
      connection = {
        ok: true,
        configured,
        method,
        message:
          method === "scrape"
            ? "Web scraping (no auth needed)"
            : "MTProto not configured — fill TELEGRAM_API_ID/HASH/SESSION in .env",
      };
    }

    if (fetchTest) {
      try {
        const messages = await fetchChannelMessages(testChannel, { limit: 5 });
        messagesCount = messages.length;
        sampleMessage =
          messages.length > 0 ? messages[messages.length - 1].text.slice(0, 200) : null;
      } catch (e: any) {
        fetchError = e.message;
      }
    }

    return NextResponse.json({
      method,
      configured,
      connection,
      testChannel,
      messagesCount,
      sampleMessage,
      fetchError,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
