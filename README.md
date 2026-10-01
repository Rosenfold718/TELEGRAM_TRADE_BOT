# Crypto Signals Trader

Личное приложение для автоматического трейдинга на Binance USDT-M Futures по сигналам из Telegram-канала.

## Возможности

- **Binance Futures (USDT-M)** — автоматическое открытие/закрытие позиций с плечом 1-125x
- **Telegram мониторинг** — парсинг публичных каналов через `t.me/s/<channel>` (web scraping)
- **Автоматическая торговля** — при появлении сигнала `XXXUSDT IS PUMPING` открывает LONG позицию, закрывает по TP/SL
- **Real-time дашборд** — баланс, статистика, графики P&L, win/loss, список сделок
- **Push-уведомления** — через Service Worker (Notification API)
- **Kill Switch** — экстренное закрытие всех позиций
- **Гибкие настройки** — плечо, размер позиции, TP/SL, интервалы polling
- **DEMO режим** — работает без API ключей (показывает mock-данные для тестирования UI)

## Стек технологий

- **Next.js 16** (App Router, Turbopack)
- **TypeScript 5**
- **Tailwind CSS 4** + **shadcn/ui**
- **Prisma ORM** + **SQLite**
- **Recharts** для графиков
- **cheerio** для HTML-парсинга Telegram
- **Zustand** для state management

## Установка и запуск

### 1. Установить зависимости

```bash
bun install
```

### 2. Настроить переменные окружения

Скопируй `.env.example` в `.env`:

```bash
cp .env.example .env
```

Заполни `.env`:

```env
# Binance API (получить: https://www.binance.com/en/my/settings/api-management)
# Нужны права: "Futures Trading" (Read + Enabled)
# Оставь пустыми для DEMO режима
BINANCE_API_KEY=
BINANCE_API_SECRET=

# Использовать testnet? (https://testnet.binancefuture.com)
BINANCE_TESTNET=false

# Telegram канал для мониторинга
TELEGRAM_CHANNEL=cryptoalr

# Trading settings (можно изменить в UI)
DEFAULT_LEVERAGE=75
DEFAULT_POSITION_SIZE_PCT=5
DEFAULT_TAKE_PROFIT_PCT=10
DEFAULT_STOP_LOSS_PCT=5
TRADING_ENABLED=false
```

### 3. Инициализировать БД

```bash
bun run db:push
```

### 4. (Опционально) Заполнить демо-данными

```bash
bun run scripts/seed-demo.ts
```

Это добавит ~50 закрытых сделок, 5 открытых, 30 сигналов и логи за последние 30 дней.

### 5. Запустить приложение

```bash
bun run dev
```

Открой `http://localhost:3000` в браузере.

## Использование

### Через UI

1. **Запусти Worker** — кнопка `Start` в карточке Worker
2. **Включи торговлю** — переключатель «Торговля включена» в Настройках
3. **Тестовый сигнал** — кнопка «Тестовый сигнал (USUSDT)» создаст сигнал вручную для проверки цепочки
4. **Kill Switch** — кнопка «Закрыть все позиции» экстренно закроет все open trades
5. **Push-уведомления** — нажми кнопку «Push», чтобы разрешить уведомления в браузере

### Через API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/binance/account` | GET | Баланс + позиции + статус подключения |
| `/api/binance/test` | GET | Тест соединения с Binance |
| `/api/trades?status=OPEN\|CLOSED\|ALL&limit=100` | GET | Список сделок |
| `/api/trades/stats` | GET | Статистика (win rate, P&L, графики) |
| `/api/signals?onlySignals=true&limit=50` | GET | Список сигналов |
| `/api/worker` | GET | Статус worker |
| `/api/worker` | POST | `{"action":"start"\|"stop"\|"killall"}` |
| `/api/worker/poll` | POST | `{"channel":"cryptoalr"}` — ручной poll |
| `/api/settings` | GET, PUT | Чтение/обновление настроек |
| `/api/logs?limit=100&level=ERROR` | GET | Логи приложения |
| `/api/test-signal` | POST | `{"symbol":"USUSDT"}` — тестовый сигнал |

## Как работает торговая стратегия

1. **Мониторинг Telegram**: Worker каждые N секунд (по умолчанию 20) парсит `https://t.me/s/<channel>` и ищет новые сообщения.

2. **Парсинг сигнала**: Если сообщение содержит шаблон `XXXUSDT IS PUMPING`, извлекается:
   - `symbol` — тикер монеты (например, `USUSDT`)
   - `priceAtSignal` — текущая цена из сообщения
   - `priceChangePct`, `volumeChangePct` — изменения цены/объёма

3. **Проверка символа**: Запрос к `GET /fapi/v1/exchangeInfo` — существует ли символ на Binance Futures.

4. **Расчёт позиции**:
   - `marginUsd = availableUsdt * positionSizePct / 100`
   - `notionalValue = marginUsd * leverage`
   - `qty = floor(notionalValue / currentPrice / stepSize) * stepSize`

5. **Установка плеча**: `POST /fapi/v1/leverage` (только для реального API)

6. **Открытие LONG позиции**: `POST /fapi/v1/order` (MARKET, BUY)

7. **Сохранение в БД**: Создаётся запись Trade со статусом OPEN

8. **Мониторинг позиции**: Worker каждые N секунд (по умолчанию 5) проверяет:
   - Если `currentPrice >= takeProfitPrice` → закрыть, причина `TAKE_PROFIT`
   - Если `currentPrice <= stopLossPrice` → закрыть, причина `STOP_LOSS`

9. **Закрытие позиции**: `POST /fapi/v1/order` (MARKET, SELL, reduceOnly)

## Важно знать

### Telegram-канал @cryptoalr

⚠️ Канал `@cryptoalr` (23 подписчика) **не имеет публичной preview-страницы**, поэтому `t.me/s/cryptoalr` возвращает только страницу-пустышку без сообщений. Web scraping не сработает.

**Решение: Telegram User API (MTProto)** — теперь поддержано в приложении:

1. Получи `api_id` и `api_hash` на https://my.telegram.org → API development tools
2. Заполни `.env`:
   ```
   TELEGRAM_API_ID=<твой api_id>
   TELEGRAM_API_HASH=<твой api_hash>
   TELEGRAM_METHOD=mtproto
   ```
3. Запусти интерактивную авторизацию (один раз):
   ```bash
   bun run scripts/telegram-login.ts
   ```
   Скрипт спросит номер телефона, код из Telegram/SMS, (опц.) 2FA пароль.
4. Скопируй выведенную session string в `.env`:
   ```
   TELEGRAM_SESSION=<длинная строка>
   ```
5. Перезапусти приложение

После этого worker сможет читать любые каналы, где состоит твой аккаунт (включая @cryptoalr).

**Альтернативный метод** — `TELEGRAM_METHOD=scrape` использует web scraping (без авторизации), но работает только для публичных каналов с preview (например, `@durov`).

### DEMO режим

Если `BINANCE_API_KEY` и `BINANCE_API_SECRET` не заданы, приложение работает в DEMO режиме:
- Возвращает mock-баланс (~12,500 USDT)
- Возвращает mock-позиции (BTCUSDT, ETHUSDT, SOLUSDT)
- Создаёт "фейковые" сделки в БД (isDemo = true)
- Все ордера "выполняются" мгновенно без реального вызова Binance API

### Для реальной торговли

1. Добавь API ключи в `.env`
2. Убедись, что у ключа есть права **Futures Trading** (Read + Enabled)
3. Установи `TRADING_ENABLED=true` или включи тумблер в UI
4. Установи `BINANCE_TESTNET=true` для тестов на testnet
5. Перезапусти приложение

## Архитектура

```
src/
├── app/
│   ├── page.tsx                    # Главная страница (дашборд)
│   ├── layout.tsx                  # Root layout (theme, fonts)
│   ├── globals.css                 # Tailwind styles
│   └── api/
│       ├── binance/
│       │   ├── account/route.ts     # GET баланс + позиции
│       │   └── test/route.ts        # GET тест соединения
│       ├── trades/
│       │   ├── route.ts             # GET список сделок
│       │   └── stats/route.ts       # GET статистика
│       ├── signals/route.ts         # GET список сигналов
│       ├── worker/
│       │   ├── route.ts             # GET статус / POST start/stop/killall
│       │   └── poll/route.ts        # POST ручной poll
│       ├── settings/route.ts        # GET / PUT настройки
│       ├── logs/route.ts            # GET логи
│       ├── notifications/route.ts   # POST push-подписка
│       └── test-signal/route.ts     # POST тестовый сигнал
├── components/
│   ├── ui/                          # shadcn/ui компоненты
│   └── dashboard/
│       ├── BalanceCard.tsx
│       ├── StatsCard.tsx
│       ├── PnLChart.tsx
│       ├── WinLossChart.tsx
│       ├── TradesTable.tsx
│       ├── SignalsList.tsx
│       ├── WorkerControls.tsx
│       ├── SettingsPanel.tsx
│       ├── KillSwitch.tsx
│       ├── LogsPanel.tsx
│       └── InfoBanner.tsx
├── lib/
│   ├── binance.ts                  # Binance Futures REST API клиент
│   ├── telegram.ts                 # Web scraper t.me/s/<channel>
│   ├── parser.ts                   # Парсер сигналов
│   ├── worker.ts                   # Background worker (singleton)
│   ├── settings.ts                 # App settings (key-value)
│   ├── types.ts                    # TypeScript типы
│   ├── db.ts                        # Prisma client
│   └── utils.ts                    # utilities
├── hooks/
│   └── use-api.ts                  # Polling hook
├── stores/
│   └── app-store.ts                # Zustand store
└── prisma/
    └── schema.prisma               # Signal, Trade, Setting, Log

public/
└── sw.js                           # Service Worker для push
```

## Деплой

### Vercel + Worker (рекомендуется для production)

1. Frontend → Vercel
2. Background worker → Railway / Fly.io / Render (нужен 24/7 процесс для polling)
3. Database → Turso (SQLite-as-a-service) или PostgreSQL

### VPS (альтернатива)

- Запусти на VPS через `bun run build && bun run start`
- Worker будет работать в том же процессе, что и Next.js
- Используй `pm2` или `systemd` для управления процессом

## Безопасность

⚠️ **ВАЖНО**: Приложение выполняет реальные сделки на Binance. Убедись, что:

1. Начни с testnet (`BINANCE_TESTNET=true`)
2. Используй минимальный размер позиции (1-2% от баланса)
3. Не включай `TRADING_ENABLED` без проверки парсера
4. Не делай `.env` файл публичным (добавь в `.gitignore`)
5. У API ключа должны быть права ТОЛЬКО на Futures Trading (без вывода средств)

## Лицензия

Личное приложение. Не для распространения.
