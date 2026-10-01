/**
 * Парсер сигналов из сообщений Telegram-канала @cryptoalr.
 *
 * Пример сообщения:
 * «🚀🤘 USUSDT IS PUMPING 🤘🚀
 *  💲 We saw a price increase of +0.00197📈 (+10.3📈%)
 *  ⚡ We also saw a volume increase of +78223670📈 (+676.3📈%)
 *  🔥🔥🔥 CURRENT PRICE: 0.02118. TIME TO TRADE!»
 *
 * Извлекаем:
 *  - symbol: USUSDT (uppercase, ends with USDT)
 *  - priceChangePct: +10.3
 *  - volumeChangePct: +676.3
 *  - priceAtSignal: 0.02118
 */

export interface ParsedSignal {
  symbol: string | null;
  baseAsset: string | null;
  isPumpSignal: boolean;
  priceAtSignal: number | null;
  priceChangePct: number | null;
  volumeChangePct: number | null;
}

// Шаблон: "USUSDT IS PUMPING" — ищет ticker формата XXXUSDT
const PUMP_RE = /\b([A-Z][A-Z0-9]{1,12}USDT)\s+IS\s+PUMPING\b/i;

// Шаблон: "+0.00197 (+10.3%)" — цена и процент изменения
const PRICE_CHANGE_RE = /price\s+increase\s+of\s+([+\-]?[\d.]+)[^()\d-]*\(([+\-]?[\d.]+)\s*%\)/i;

// Шаблон: "volume increase of +78223670 (+676.3%)"
const VOLUME_CHANGE_RE = /volume\s+increase\s+of\s+([+\-]?[\d.]+)[^()\d-]*\(([+\-]?[\d.]+)\s*%\)/i;

// Шаблон: "CURRENT PRICE: 0.02118"
const CURRENT_PRICE_RE = /CURRENT\s+PRICE[:\s]+([\d.]+)/i;

export function parseSignal(rawText: string): ParsedSignal {
  const result: ParsedSignal = {
    symbol: null,
    baseAsset: null,
    isPumpSignal: false,
    priceAtSignal: null,
    priceChangePct: null,
    volumeChangePct: null,
  };

  // Удаляем emoji перед парсингом (всё, что не ASCII буквы/цифры/пробелы/проценты)
  const clean = rawText.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu, " ");

  // 1. Pump-сигнал и symbol
  const mPump = clean.match(PUMP_RE);
  if (mPump) {
    result.isPumpSignal = true;
    result.symbol = mPump[1].toUpperCase();
    result.baseAsset = result.symbol.replace(/USDT$/, "");
  }

  // 2. Изменение цены
  const mPrice = clean.match(PRICE_CHANGE_RE);
  if (mPrice) {
    result.priceAtSignal = parseFloat(mPrice[1]);
    result.priceChangePct = parseFloat(mPrice[2]);
  }

  // 3. Изменение объёма
  const mVol = clean.match(VOLUME_CHANGE_RE);
  if (mVol) {
    result.volumeChangePct = parseFloat(mVol[2]);
  }

  // 4. CURRENT PRICE
  const mCur = clean.match(CURRENT_PRICE_RE);
  if (mCur) {
    result.priceAtSignal = parseFloat(mCur[1]);
  }

  return result;
}

/**
 * Проверка — является ли сообщение сигналом на торговлю.
 * Должно содержать символ + "IS PUMPING".
 */
export function isTradingSignal(parsed: ParsedSignal): boolean {
  return Boolean(parsed.isPumpSignal && parsed.symbol);
}

/**
 * Тестовый сигнал для отладки.
 */
export const SAMPLE_SIGNAL_TEXT = `🚀🤘 USUSDT IS PUMPING 🤘🚀
💲 We saw a price increase of +0.00197📈 (+10.3📈%)
⚡ We also saw a volume increase of +78223670📈 (+676.3📈%)
🔥🔥🔥 CURRENT PRICE: 0.02118. TIME TO TRADE!`;

export function debugParse(text: string = SAMPLE_SIGNAL_TEXT): ParsedSignal {
  const parsed = parseSignal(text);
  console.log("[parser] debug:", { text, parsed });
  return parsed;
}
