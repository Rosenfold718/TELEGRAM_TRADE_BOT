import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import * as dotenv from "dotenv";

// Загружаем .env при запуске (важно для dev server, который запускается через bash -c)
dotenv.config({ path: ".env", override: true });

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL не задан в .env");
  }

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
}

// Force recreate Prisma client on every dev reload (don't cache in global)
let dbInstance: PrismaClient | null = null;

function getDb(): PrismaClient {
  if (dbInstance) return dbInstance;
  dbInstance = createPrismaClient();
  return dbInstance;
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const instance = getDb();
    const value = (instance as any)[prop];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
