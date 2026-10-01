"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useState } from "react";

export function InfoBanner() {
  const [show, setShow] = useState(true);
  if (!show) return null;
  return (
    <Alert className="border-amber-600/20 bg-amber-500/5 mb-4">
      <Info className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-sm text-amber-700">DEMO режим активен</AlertTitle>
      <AlertDescription className="text-xs text-amber-700/80 space-y-2">
        <p>
          Сейчас приложение работает с <b>демо-данными</b>: Binance API ключи не настроены,
          Telegram MTProto не сконфигурирован (видно в карточке «Telegram» справа).
        </p>
        <p>
          Чтобы запустить реальную торговлю:
        </p>
        <ol className="list-decimal list-inside space-y-1 ml-1">
          <li>
            Настрой <b>Telegram MTProto</b> — карточка «Telegram» содержит пошаговую инструкцию
            (получить <code className="font-mono text-[11px] bg-amber-500/10 px-1 rounded">api_id</code>,
            авторизоваться, скопировать session в <code className="font-mono text-[11px] bg-amber-500/10 px-1 rounded">.env</code>)
          </li>
          <li>
            Добавь <code className="font-mono text-[11px] bg-amber-500/10 px-1 rounded">BINANCE_API_KEY</code> и{" "}
            <code className="font-mono text-[11px] bg-amber-500/10 px-1 rounded">BINANCE_API_SECRET</code> в{" "}
            <code className="font-mono text-[11px] bg-amber-500/10 px-1 rounded">.env</code>
          </li>
          <li>
            Включи тумблер «Торговля включена» в Настройках
          </li>
          <li>
            Нажми «Start» в Worker — приложение начнёт парсить Telegram и открывать сделки
          </li>
        </ol>
        <p>
          Кнопка <b>«Тестовый сигнал»</b> создаёт сигнал вручную, чтобы проверить всю цепочку
          (парсинг → Binance → БД → отображение).
        </p>
        <button
          onClick={() => setShow(false)}
          className="text-xs underline underline-offset-2 hover:text-amber-800"
        >
          Скрыть это сообщение
        </button>
      </AlertDescription>
    </Alert>
  );
}
