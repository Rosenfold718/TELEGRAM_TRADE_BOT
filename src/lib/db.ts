import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import * as dotenv from "dotenv";

// Загружаем .env при запуске (важно для dev server, который запускается через bash -c)
// На Vercel .env недоступен, но переменные окружения уже в process.env
try {
  dotenv.config({ path: ".env", override: true });
} catch (e) {
  // ignore — на Vercel .env нет
}

let dbInstance: PrismaClient | null = null;
let initError: string | null = null;

function createPrismaClient(): PrismaClient | null {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    initError = "DATABASE_URL не задан в environment variables";
    console.warn("[db]", initError);
    return null;
  }

  try {
    // Turso/libSQL (libsql:// или libsqls://) — облачная БД
    if (databaseUrl.startsWith("libsql://") || databaseUrl.startsWith("libsqls://")) {
      const authToken = process.env.DATABASE_AUTH_TOKEN;
      console.log("[db] Using Turso/libSQL:", databaseUrl);
      const adapter = new PrismaLibSql({
        url: databaseUrl,
        authToken: authToken || undefined,
      });
      return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      });
    }

    // Обычный SQLite (локальный файл) — fallback
    console.log("[db] Using local SQLite:", databaseUrl);
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  } catch (e: any) {
    initError = `Failed to create Prisma client: ${e.message}`;
    console.error("[db]", initError);
    return null;
  }
}

function getDb(): PrismaClient | null {
  if (dbInstance !== null) return dbInstance;
  if (initError !== null) return null; // already tried, failed
  dbInstance = createPrismaClient();
  return dbInstance;
}

// Прокси с поддержкой null — если БД не доступна, возвращаем пустые заглушки
// чтобы API не падал с 500, а отдавал пустые данные
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const instance = getDb();
    if (instance === null) {
      // БД недоступна — возвращаем stub, который отдаёт пустые данные
      // Это позволяет UI работать, даже если DATABASE_URL не задан
      if (prop === "trade") {
        return {
          findMany: async () => [],
          count: async () => 0,
          findUnique: async () => null,
          findFirst: async () => null,
          create: async () => { throw new Error(initError || "DB not available"); },
          update: async () => { throw new Error(initError || "DB not available"); },
          delete: async () => { throw new Error(initError || "DB not available"); },
          deleteMany: async () => ({ count: 0 }),
        };
      }
      if (prop === "signal") {
        return {
          findMany: async () => [],
          count: async () => 0,
          findUnique: async () => null,
          findFirst: async () => null,
          create: async () => { throw new Error(initError || "DB not available"); },
          update: async () => { throw new Error(initError || "DB not available"); },
          delete: async () => { throw new Error(initError || "DB not available"); },
        };
      }
      if (prop === "setting") {
        return {
          findMany: async () => [],
          count: async () => 0,
          findUnique: async () => null,
          findFirst: async () => null,
          upsert: async () => { throw new Error(initError || "DB not available"); },
          update: async () => { throw new Error(initError || "DB not available"); },
          delete: async () => { throw new Error(initError || "DB not available"); },
        };
      }
      if (prop === "log") {
        return {
          findMany: async () => [],
          count: async () => 0,
          findUnique: async () => null,
          findFirst: async () => null,
          create: async () => { throw new Error(initError || "DB not available"); },
          update: async () => { throw new Error(initError || "DB not available"); },
          delete: async () => { throw new Error(initError || "DB not available"); },
          deleteMany: async () => ({ count: 0 }),
        };
      }
      // По умолчанию возвращаем функцию-заглушку
      return async () => null;
    }
    const value = (instance as any)[prop];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

// Утилита для проверки статуса БД
export function isDbAvailable(): boolean {
  return getDb() !== null;
}

export function getDbError(): string | null {
  return initError;
}
