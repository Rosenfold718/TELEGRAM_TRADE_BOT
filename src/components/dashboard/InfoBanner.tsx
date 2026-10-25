"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useState } from "react";
import { useApi } from "@/hooks/use-api";

interface HealthResponse {
  components: {
    binance?: { configured: boolean; status: string; statusLabel: string; error?: string };
    telegram?: { configured: boolean; status: string; statusLabel: string };
  };
  checklist: { id: string; status: "done" | "pending" | "warning" }[];
}

export function InfoBanner() {
  const [show, setShow] = useState(true);
  const { data, loading } = useApi<HealthResponse>("/api/health", { intervalMs: 15000 });

  // Пока /api/health ещё грузится — не показываем (чтобы не моргать DEMO)
  if (loading && !data) return null;

  if (!show) return null;

  const binance = data?.components?.binance;
  const telegram = data?.components?.telegram;

  // Если data ещё не пришёл — не показываем
  if (!binance || !telegram) return null;

  const binanceConfigured = binance?.configured ?? false;
  const telegramConfigured = telegram?.configured ?? false;
  const isBanned = binance?.status === "banned";
  const hasBinanceError = binance?.status === "error";
  const isBinanceOk = binance?.status === "ok";

  // Если всё подключено и работает — не показываем
  if (isBinanceOk && telegramConfigured) return null;

  // Тип уведомления
  const isLiveBanned = binanceConfigured && isBanned;
  const isLiveError = binanceConfigured && hasBinanceError;
  const isDemoMode = !binanceConfigured;
  const isBinanceOkTelegramPending = isBinanceOk && !telegramConfigured;

  const isErrorState = isLiveBanned || isLiveError;
  const alertClass = isErrorState
    ? "border-red-500/20 bg-red-500/5"
    : "border-amber-600/20 bg-amber-500/5";
  const iconClass = isErrorState ? "text-red-600" : "text-amber-600";
  const titleClass = isErrorState ? "text-red-700" : "text-amber-700";
  const descClass = isErrorState ? "text-red-700/80" : "text-amber-700/80";

  return (
    <Alert className={`mb-4 ${alertClass}`}>
      <Info className={`h-4 w-4 ${iconClass}`} />
      <AlertTitle className={`text-sm ${titleClass}`}>
        {isLiveBanned
          ? "IP сервера заблокирован Binance"
          : isLiveError
          ? "Binance API возвращает ошибку"
          : isBinanceOkTelegramPending
          ? "Binance подключён, Telegram ожидает настройки"
          : "DEMO режим активен"}
      </AlertTitle>
      <AlertDescription className={`text-xs space-y-2 ${descClass}`}>
        {isLiveBanned ? (
          <>
            <p>
              API ключи Binance настроены и работают, но текущий IP сервера временно заблокирован
              Binance (HTTP 418) из-за превышения лимита запросов.
            </p>
            <p>Бан длится обычно 2-24 часа, после чего автоматически снимется. Чтобы ускорить:</p>
            <ol className="list-decimal list-inside space-y-1 ml-1">
              <li>Дождись окончания бана (см. сообщение в карточке баланса)</li>
              <li>Или задеплой проект на Vercel/VPS — там IP другой, бана не будет</li>
              <li>Мы добавили кэширование запросов (15 сек), чтобы избежать повторного бана</li>
            </ol>
            <p>
              Когда Telegram MTProto будет настроен — приложение сможет получать сигналы
              даже без рабочего Binance (они будут сохраняться в БД).
            </p>
          </>
        ) : isLiveError ? (
          <>
            <p>API ключи Binance настроены, но при подключении возникает ошибка:</p>
            <div className="font-mono text-[11px] bg-red-500/10 border border-red-500/30 p-2 rounded">
              {binance?.error || "Неизвестная ошибка"}
            </div>
            <p>Возможные причины:</p>
            <ol className="list-decimal list-inside space-y-1 ml-1">
              <li>
                <b>401 (Invalid API-key, IP, or permissions)</b> — твой текущий IP не добавлен
                в Binance API Restrictions, или у ключа нет прав на Futures Trading.
              </li>
              <li>
                Добавь свой IP в{" "}
                <a href="https://www.binance.com/en/my/settings/api-management" target="_blank" rel="noreferrer" className="underline">
                  Binance API Management
                </a>{" "}
                → IP Restrictions → Restrict access to trusted IPs only
              </li>
              <li>
                Узнай свой IP:{" "}
                <a href="https://api.ipify.org" target="_blank" rel="noreferrer" className="underline">
                  https://api.ipify.org
                </a>
              </li>
              <li>
                После IP-фильтра включи галочку <b>«Enable Futures»</b> в Permissions
              </li>
            </ol>
          </>
        ) : isBinanceOkTelegramPending ? (
          <>
            <p>
              ✅ <b>Binance API</b> подключён и работает ({binance?.statusLabel}).
            </p>
            <p>
              ⚠️ <b>Telegram MTProto</b> ещё не настроен — приложение не может получать сигналы
              из канала @cryptoalr.
            </p>
            <p>Чтобы завершить настройку:</p>
            <ol className="list-decimal list-inside space-y-1 ml-1">
              <li>
                Перейди на{" "}
                <a href="https://my.telegram.org" target="_blank" rel="noreferrer" className="underline">
                  my.telegram.org
                </a>{" "}
                → API development tools, создай приложение и получи <code className="font-mono bg-amber-500/10 px-1 rounded">api_id</code> и{" "}
                <code className="font-mono bg-amber-500/10 px-1 rounded">api_hash</code>
              </li>
              <li>
                Добавь их в <code className="font-mono bg-amber-500/10 px-1 rounded">.env</code> (TELEGRAM_API_ID, TELEGRAM_API_HASH)
              </li>
              <li>
                Запусти <code className="font-mono bg-amber-500/10 px-1 rounded">bun run scripts/telegram-login.ts</code> и авторизуйся по номеру телефона
              </li>
              <li>
                Скопируй session string в <code className="font-mono bg-amber-500/10 px-1 rounded">.env</code> (TELEGRAM_SESSION)
              </li>
              <li>Включи тумблер «Торговля включена» в Настройках</li>
              <li>Нажми «Start» в Worker — приложение начнёт торговать</li>
            </ol>
          </>
        ) : isDemoMode ? (
          <>
            <p>
              Сейчас приложение работает с <b>демо-данными</b>:
              {!binanceConfigured && " Binance API ключи не настроены,"}
              {" Telegram MTProto не сконфигурирован."}
            </p>
            <p>Чтобы запустить реальную торговлю:</p>
            <ol className="list-decimal list-inside space-y-1 ml-1">
              <li>
                Настрой <b>Telegram MTProto</b> — карточка «Telegram» справа содержит пошаговую инструкцию
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
        ) : null}
        <button
          onClick={() => setShow(false)}
          className={`text-xs underline underline-offset-2 ${isErrorState ? "hover:text-red-800" : "hover:text-amber-800"}`}
        >
          Скрыть это сообщение
        </button>
      </AlertDescription>
    </Alert>
  );
}
