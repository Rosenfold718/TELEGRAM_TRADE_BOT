/**
 * Web scraper: парсит публичные сообщения канала через t.me/s/<channel>.
 *
 * ⚠️ Работает НЕ для всех каналов. Telegram может отдавать только preview-заглушку
 * (например, для каналов <100 подписчиков или с настройкой "Restrict forwarding").
 * Для надёжного чтения используй MTProto метод (telegram-mtproto.ts).
 *
 * Примеры URL:
 *  https://t.me/s/cryptoalr          — последние ~20 сообщений
 *  https://t.me/s/cryptoalr/68        — конкретное сообщение #68 и несколько соседних
 */

import * as cheerio from "cheerio";

export interface TelegramMessage {
  id: number;
  channelName: string;
  text: string;
  html: string;
  url: string;
  datetime: string | null;
  timestamp: number | null;
  views: number | null;
}

/**
 * Загружает и парсит сообщения канала.
 */
export async function fetchChannelMessages(
  channelName: string,
  options: { beforeId?: number; limit?: number } = {}
): Promise<TelegramMessage[]> {
  let url = `https://t.me/s/${channelName}`;
  if (options.beforeId) {
    url += `/${options.beforeId}`;
  }

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9,ru;q=0.8",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Telegram: HTTP ${response.status} для ${url}`);
  }

  const html = await response.text();
  return parseMessages(html, channelName);
}

export function parseMessages(html: string, channelName: string): TelegramMessage[] {
  const $ = cheerio.load(html);
  const messages: TelegramMessage[] = [];

  $(".tgme_widget_message").each((_, el) => {
    const $el = $(el);
    const post = $el.attr("data-post") || "";
    const match = post.match(/\/(\d+)$/);
    if (!match) return;

    const id = parseInt(match[1], 10);
    const $text = $el.find(".tgme_widget_message_text");
    const text = $text.text().trim();
    const htmlContent = $text.html() || "";
    const datetime = $el.find(".tgme_widget_message_date time").attr("datetime") || null;
    const timestamp = datetime ? Date.parse(datetime) : null;
    const url = `https://t.me/${channelName}/${id}`;
    const viewsText = $el.find(".tgme_widget_message_views").text().trim();
    const views = parseViews(viewsText);

    messages.push({ id, channelName, text, html: htmlContent, url, datetime, timestamp, views });
  });

  messages.sort((a, b) => a.id - b.id);
  return messages;
}

function parseViews(text: string): number | null {
  if (!text) return null;
  let n = parseFloat(text.replace(/[KkMm]/g, ""));
  if (/K/i.test(text)) n *= 1_000;
  if (/M/i.test(text)) n *= 1_000_000;
  return n;
}

/**
 * Возвращает только новые сообщения (id > lastKnownId).
 */
export function filterNewMessages(
  messages: TelegramMessage[],
  lastKnownId: number
): TelegramMessage[] {
  return messages.filter((m) => m.id > lastKnownId);
}
