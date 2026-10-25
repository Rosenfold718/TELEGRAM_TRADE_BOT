# Vercel Deployment Instructions

## TL;DR — что нужно сделать

1. Создать проект в Vercel через UI
2. Запустить скрипт с env vars (или добавить вручную через UI)
3. Деплой готов

## Подробная инструкция

### Шаг 1: Создай проект в Vercel

1. Открой **https://vercel.com/new**
2. В разделе "Import Git Repository" найди `Rosenfold718/TELEGRAM_TRADE_BOT`
   - Если репозиторий не виден — нажми "Adjust GitHub App Permissions"
   - Дай Vercel доступ к этому репозиторию
3. Нажми **«Import»** на репозитории
4. Настройки проекта (Vercel подхватит из `vercel.json`, но проверь):
   - **Framework Preset**: Next.js
   - **Build Command**: `bun run vercel-build` (или оставь auto)
   - **Install Command**: `bun install` (или оставь auto)
   - **Output Directory**: `.next` (auto)
5. **НЕ добавляй env vars вручную** — мы сделаем это скриптом
6. Нажми **«Deploy»** — проект создастся, первый билд может упасть без env vars, это нормально

### Шаг 2: Запусти скрипт добавления env vars

```bash
bash scripts/vercel-env-setup.sh
```

Скрипт добавит 18 переменных для production, preview и development:
- Binance API (3 vars)
- Database Turso (3 vars)
- Telegram (5 vars, 3 пустые — добавишь позже)
- Worker (2 vars)
- Trading defaults (5 vars)

### Шаг 3: Перезапусти деплой

После добавления env vars — пере-запусти деплой:
1. Открой https://vercel.com/grosenfold-gmailcoms-projects/telegram-trade-bot
2. Нажми "Redeploy" на последнем деплое
3. Дождись окончания (1-2 минуты)

### Шаг 4: Проверь

Открой URL проекта в Vercel (что-то вроде `telegram-trade-bot.vercel.app`).
Должен открыться дашборд Crypto Signals Trader.

## Что НЕ работает на Vercel сейчас

1. **Telegram MTProto** — `TELEGRAM_API_ID`, `TELEGRAM_API_HASH`, `TELEGRAM_SESSION` пустые.
   Нужно настроить через `bun run scripts/telegram-login.ts` локально, потом добавить в Vercel.

2. **Binance IP-фильтр** — на Vercel IP динамический. Варианты:
   - **Vercel Pro** ($20/мес) — статический egress IP
   - **Binance API без IP-фильтра** (но тогда нельзя включить Futures Trading permission)

3. **Background Worker** — Vercel serverless functions не поддерживают
   long-running processes. Worker будет жить только во время HTTP запросов.
   Для 24/7 нужен VPS или Vercel Cron + external queue (Turso/Redis).

## Vercel CLI (опционально)

Если хочешь использовать CLI:

```bash
# Установка
npm install -g vercel

# Авторизация (создай токен на https://vercel.com/account/tokens)
export VERCEL_TOKEN=your_token

# Деплой
vercel --prod --token $VERCEL_TOKEN

# Логи
vercel logs --token $VERCEL_TOKEN
```

## Vercel Dashboard

- **Project**: https://vercel.com/grosenfold-gmailcoms-projects/telegram-trade-bot
- **Settings**: https://vercel.com/grosenfold-gmailcoms-projects/telegram-trade-bot/settings
- **Env vars**: https://vercel.com/grosenfold-gmailcoms-projects/telegram-trade-bot/settings/environment-variables
- **Deployments**: https://vercel.com/grosenfold-gmailcoms-projects/telegram-trade-bot/deployments
