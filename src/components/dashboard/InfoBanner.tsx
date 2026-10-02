"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useState } from "react";
import { useApi } from "@/hooks/use-api";
import type { BinanceAccountResponse } from "@/lib/types";

export function InfoBanner() {
  const [show, setShow] = useState(true);
  const { data } = useApi<BinanceAccountResponse>("/api/binance/account", { intervalMs: 30000 });

  if (!show) return null;

  const binanceConfigured = data?.configured;
  const telegramConfigured = Boolean(
    typeof window !== "undefined"
      ? true
      : process.env.TELEGRAM_API_ID && process.env.TELEGRAM_API_HASH && process.env.TELEGRAM_SESSION
  );
  const isBanned = data?.connectivity?.error?.includes("banned") || data?.error?.includes("banned");

  // Если Binance подключен и не забанен — не показываем
  if (binanceConfigured && !isBanned && telegramConfigured) return null;

  const isLiveBanned = binanceConfigured && isBanned;

  return (
    <Alert className={`mb-4 ${isLiveBanned ? "border-red-500/20 bg-red-500/5" : "border-amber-600/20 bg-amber-500/5"}`}>
      <Info className={`h-4 w-4 ${isLiveBanned ? "text-red-600" : "text-amber-600"}`} />
      <AlertTitle className={`text-sm ${isLiveBanned ? "text-red-700" : "text-amber-700"}`}>
        {isLiveBanned ? "IP сервера заблокирован Binance" : "DEMO режим активен"}
      </AlertTitle>
      <AlertDescription className={`text-xs space-y-2 ${isLiveBanned ? "text-red-700/80" : "text-amber-700/80"}`}>
        {isLiveBanned ? (
          <>
            <p>
              API ключи Binance настроены и работают, но текущий IP сервера временно заблокирован
              Binance (HTTP 418) из-за превышения лимита запросов.
            </p>
            <p>
              Бан длится обычно 2-24 часа, после чего автоматически снимется. Чтобы ускорить:
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-1">
              <li>Дождись окончания бана (см. сообщение в карточке баланса)</li>
              <li>Или задеплой проект на Vercel — там IP другой, бана не будет</li>
              <li>Мы добавили кэширование запросов (15 сек), чтобы избежать повторного бана</li>
            </ol>
            <p>
              Когда Telegram MTProto будет настроен — приложение сможет получать сигналы
              даже без рабочего Binance (они будут сохраняться в БД).
            </p>
          </>
        ) : (
          <>
            <p>
              Сейчас приложение работает с <b>демо-данными</b>:
              {!binanceConfigured && " Binance API ключи не настроены,"}
              {" Telegram MTProto не сконфигурирован."}
            </p>
            <p>Чтобы запустить реальную торговлю:</p>
            <ol className="list-decimal list-inside space-y-1 ml-1">
              <li>
                Настрой <b>Telegram MTProto</b> — карточка «Telegram» содержит пошаговую инструкцию
              </li>
              {!binanceConfigured && (
                <li>
                  Добавь <code className="font-mono text-[11px] bg-amber-500/10 px-1 rounded">BINANCE_API_KEY</code> и{" "}
                  <code className="font-mono text-[11px] bg-amber-500/10 px-1 rounded">BINANCE_API_SECRET</code> в{" "}
                  <code className="font-mono text-[11px] bg-amber-500/10 px-1 rounded">.env</code>
                </li>
              )}
              <li>Включи тумблер «Торговля включена» в Настройках</li>
              <li>Нажми «Start» в Worker — приложение начнёт парсить Telegram и открывать сделки</li>
            </ol>
            <p>
              Кнопка <b>«Тестовый сигнал»</b> создаёт сигнал вручную для проверки всей цепочки
              (парсинг → Binance → БД → отображение).
            </p>
          </>
        )}
        <button
          onClick={() => setShow(false)}
          className={`text-xs underline underline-offset-2 ${isLiveBanned ? "hover:text-red-800" : "hover:text-amber-800"}`}
        >
          Скрыть это сообщение
        </button>
      </AlertDescription>
    </Alert>
  );
}
