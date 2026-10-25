#!/bin/bash
# Скрипт добавляет все Environment Variables в Vercel проект telegram-trade-bot.
# Запуск: VERCEL_TOKEN=your_token bash scripts/vercel-env-setup.sh
#
# Требует: Vercel token с правами на edit env vars.
# Создать токен: https://vercel.com/account/tokens
#
# ВАЖНО: проект telegram-trade-bot должен быть создан в Vercel UI.
# Если проекта нет — скрипт вернёт ошибку "Project not found",
# и нужно сначала создать проект через https://vercel.com/new

set -e

# ВАЖНО: замени на свой Vercel token (https://vercel.com/account/tokens)
# Токен НЕ коммитить в git — берём из environment или просим ввести
TOKEN="${VERCEL_TOKEN:-}"
if [ -z "$TOKEN" ]; then
  echo "❌ VERCEL_TOKEN не задан"
  echo "   Установи переменную окружения:"
  echo "   export VERCEL_TOKEN=your_token_here"
  echo "   Или запусти:"
  echo "   VERCEL_TOKEN=your_token bash scripts/vercel-env-setup.sh"
  exit 1
fi

PROJECT="telegram-trade-bot"
TEAM_ID="team_oUPFwFKY8NNXmFEnog4syHR6"
API="https://api.vercel.com/v9/projects/$PROJECT/env?teamId=$TEAM_ID"

# 1. Проверяем, существует ли проект
echo "=== Проверка проекта $PROJECT ==="
PROJECT_CHECK=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  "https://api.vercel.com/v9/projects/$PROJECT?teamId=$TEAM_ID")

if [ "$PROJECT_CHECK" = "404" ]; then
  echo "❌ Проект $PROJECT не найден в Vercel!"
  echo ""
  echo "Создай его вручную:"
  echo "  1. Открой https://vercel.com/new"
  echo "  2. Найди репозиторий Rosenfold718/TELEGRAM_TRADE_BOT"
  echo "  3. Нажми Import → Deploy (env vars добавишь позже)"
  echo "  4. После создания проекта — запусти этот скрипт снова"
  exit 1
fi

if [ "$PROJECT_CHECK" = "403" ]; then
  echo "❌ Token не имеет прав на чтение проекта"
  exit 1
fi

if [ "$PROJECT_CHECK" = "200" ]; then
  echo "✅ Проект найден, добавляю env vars..."
  echo ""
else
  echo "⚠️ Неожиданный ответ: $PROJECT_CHECK"
  exit 1
fi

# 2. Функция для добавления переменной
add_env() {
  local key="$1"
  local value="$2"
  local targets="$3"  # "production preview development"

  local added=()
  for target in $targets; do
    local response=$(curl -s -X POST \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"key\":\"$key\",\"value\":\"$value\",\"type\":\"encrypted\",\"target\":[\"$target\"]}" \
      "$API")

    if echo "$response" | grep -q '"id"'; then
      added+=("$target")
    elif echo "$response" | grep -q 'already exists'; then
      added+=("$target(already)")
    else
      echo "  ❌ Error for $key ($target): $response"
      return 1
    fi
  done

  echo "  ✓ $key → ${added[*]}"
}

# 3. ВСЕ ENV VARS
echo "=== Добавляю переменные ==="

# Читаем секреты из environment (НЕ коммитим в git!)
BINANCE_API_KEY="${BINANCE_API_KEY:?не задан — export BINANCE_API_KEY=...}"
BINANCE_API_SECRET="${BINANCE_API_SECRET:?не задан — export BINANCE_API_SECRET=...}"
DATABASE_AUTH_TOKEN="${DATABASE_AUTH_TOKEN:?не задан — export DATABASE_AUTH_TOKEN=...}"

# Binance
add_env "BINANCE_API_KEY" "$BINANCE_API_KEY" "production preview development"
add_env "BINANCE_API_SECRET" "$BINANCE_API_SECRET" "production preview development"
add_env "BINANCE_TESTNET" "false" "production preview development"

# Database (Turso)
add_env "DATABASE_URL" "libsql://tradebotdatabase-105vl.aws-eu-west-1.turso.io" "production preview development"
add_env "DATABASE_AUTH_TOKEN" "$DATABASE_AUTH_TOKEN" "production preview development"
add_env "PRISMA_DATABASE_URL" "file:/tmp/dummy.db" "production preview development"

# Telegram (пока пустые)
add_env "TELEGRAM_CHANNEL" "cryptoalr" "production preview development"
add_env "TELEGRAM_METHOD" "mtproto" "production preview development"
add_env "TELEGRAM_API_ID" "" "production preview development"
add_env "TELEGRAM_API_HASH" "" "production preview development"
add_env "TELEGRAM_SESSION" "" "production preview development"

# Worker
add_env "WORKER_POLL_INTERVAL_SEC" "20" "production preview development"
add_env "WORKER_CHECK_INTERVAL_SEC" "5" "production preview development"

# Trading defaults
add_env "DEFAULT_LEVERAGE" "75" "production preview development"
add_env "DEFAULT_POSITION_SIZE_PCT" "5" "production preview development"
add_env "DEFAULT_TAKE_PROFIT_PCT" "10" "production preview development"
add_env "DEFAULT_STOP_LOSS_PCT" "5" "production preview development"
add_env "TRADING_ENABLED" "false" "production preview development"

echo ""
echo "=== Готово! Все 18 env vars добавлены ==="
echo ""
echo "Проверить статус: https://vercel.com/grosenfold-gmailcoms-projects/telegram-trade-bot/settings/environment-variables"
