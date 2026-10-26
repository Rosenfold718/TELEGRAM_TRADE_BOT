# ===== Dockerfile для деплоя на VPS =====
# Используется официальный Node.js 22 + bun
#
# Сборка: docker build -t telegram-trade-bot .
# Запуск:  docker run -p 3000:3000 --env-file .env telegram-trade-bot
#
# Для production:
#   docker run -d --name trade-bot --restart unless-stopped \
#     -p 3000:3000 --env-file .env telegram-trade-bot

# ---------- Stage 1: Dependencies ----------
FROM oven/bun:latest AS deps
WORKDIR /app

# Копируем package.json и bun.lock
COPY package.json bun.lock ./

# Устанавливаем зависимости (кешируется отдельно)
RUN bun install --frozen-lockfile

# ---------- Stage 2: Build ----------
FROM oven/bun:latest AS builder
WORKDIR /app

# Копируем зависимости
COPY --from=deps /app/node_modules ./node_modules

# Копируем исходники
COPY . .

# Генерируем Prisma клиент
RUN bun run db:generate || true

# Билдим Next.js
RUN bun run build

# ---------- Stage 3: Production ----------
FROM oven/bun:latest AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Создаём непривилегированного пользователя
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Копируем только нужные файлы
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "server.js"]
