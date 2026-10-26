module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/child_process [external] (child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("child_process", () => require("child_process"));

module.exports = mod;
}),
"[project]/src/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "db",
    ()=>db,
    "getDbError",
    ()=>getDbError,
    "isDbAvailable",
    ()=>isDbAvailable
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$adapter$2d$libsql$2f$dist$2f$index$2d$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@prisma/adapter-libsql/dist/index-node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dotenv$2f$dist$2f$index$2e$cjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/dotenv/dist/index.cjs [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$adapter$2d$libsql$2f$dist$2f$index$2d$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$adapter$2d$libsql$2f$dist$2f$index$2d$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
// Загружаем .env при запуске (важно для dev server, который запускается через bash -c)
// На Vercel .env недоступен, но переменные окружения уже в process.env
try {
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dotenv$2f$dist$2f$index$2e$cjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["config"]({
        path: ".env",
        override: true
    });
} catch (e) {
// ignore — на Vercel .env нет
}
let dbInstance = null;
let initError = null;
function createPrismaClient() {
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
            const adapter = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$adapter$2d$libsql$2f$dist$2f$index$2d$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PrismaLibSql"]({
                url: databaseUrl,
                authToken: authToken || undefined
            });
            return new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]({
                adapter,
                log: ("TURBOPACK compile-time truthy", 1) ? [
                    "error",
                    "warn"
                ] : "TURBOPACK unreachable"
            });
        }
        // Обычный SQLite (локальный файл) — fallback
        console.log("[db] Using local SQLite:", databaseUrl);
        return new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]({
            log: ("TURBOPACK compile-time truthy", 1) ? [
                "error",
                "warn"
            ] : "TURBOPACK unreachable"
        });
    } catch (e) {
        initError = `Failed to create Prisma client: ${e.message}`;
        console.error("[db]", initError);
        return null;
    }
}
function getDb() {
    if (dbInstance !== null) return dbInstance;
    if (initError !== null) return null; // already tried, failed
    dbInstance = createPrismaClient();
    return dbInstance;
}
const db = new Proxy({}, {
    get (_target, prop) {
        const instance = getDb();
        if (instance === null) {
            // БД недоступна — возвращаем stub, который отдаёт пустые данные
            // Это позволяет UI работать, даже если DATABASE_URL не задан
            if (prop === "trade") {
                return {
                    findMany: async ()=>[],
                    count: async ()=>0,
                    findUnique: async ()=>null,
                    findFirst: async ()=>null,
                    create: async ()=>{
                        throw new Error(initError || "DB not available");
                    },
                    update: async ()=>{
                        throw new Error(initError || "DB not available");
                    },
                    delete: async ()=>{
                        throw new Error(initError || "DB not available");
                    },
                    deleteMany: async ()=>({
                            count: 0
                        })
                };
            }
            if (prop === "signal") {
                return {
                    findMany: async ()=>[],
                    count: async ()=>0,
                    findUnique: async ()=>null,
                    findFirst: async ()=>null,
                    create: async ()=>{
                        throw new Error(initError || "DB not available");
                    },
                    update: async ()=>{
                        throw new Error(initError || "DB not available");
                    },
                    delete: async ()=>{
                        throw new Error(initError || "DB not available");
                    }
                };
            }
            if (prop === "setting") {
                return {
                    findMany: async ()=>[],
                    count: async ()=>0,
                    findUnique: async ()=>null,
                    findFirst: async ()=>null,
                    upsert: async ()=>{
                        throw new Error(initError || "DB not available");
                    },
                    update: async ()=>{
                        throw new Error(initError || "DB not available");
                    },
                    delete: async ()=>{
                        throw new Error(initError || "DB not available");
                    }
                };
            }
            if (prop === "log") {
                return {
                    findMany: async ()=>[],
                    count: async ()=>0,
                    findUnique: async ()=>null,
                    findFirst: async ()=>null,
                    create: async ()=>{
                        throw new Error(initError || "DB not available");
                    },
                    update: async ()=>{
                        throw new Error(initError || "DB not available");
                    },
                    delete: async ()=>{
                        throw new Error(initError || "DB not available");
                    },
                    deleteMany: async ()=>({
                            count: 0
                        })
                };
            }
            // По умолчанию возвращаем функцию-заглушку
            return async ()=>null;
        }
        const value = instance[prop];
        return typeof value === "function" ? value.bind(instance) : value;
    }
});
function isDbAvailable() {
    return getDb() !== null;
}
function getDbError() {
    return initError;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/settings.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "DEFAULT_SETTINGS",
    ()=>DEFAULT_SETTINGS,
    "getSettings",
    ()=>getSettings,
    "updateSettings",
    ()=>updateSettings
]);
/**
 * Настройки приложения, хранятся в таблице Setting (key-value).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const DEFAULT_SETTINGS = {
    leverage: parseInt(process.env.DEFAULT_LEVERAGE || "75", 10),
    positionSizePct: parseFloat(process.env.DEFAULT_POSITION_SIZE_PCT || "5"),
    takeProfitPct: parseFloat(process.env.DEFAULT_TAKE_PROFIT_PCT || "10"),
    stopLossPct: parseFloat(process.env.DEFAULT_STOP_LOSS_PCT || "5"),
    tradingEnabled: process.env.TRADING_ENABLED === "true",
    telegramChannel: process.env.TELEGRAM_CHANNEL || "cryptoalr",
    pollIntervalSec: parseInt(process.env.WORKER_POLL_INTERVAL_SEC || "20", 10),
    checkIntervalSec: parseInt(process.env.WORKER_CHECK_INTERVAL_SEC || "5", 10)
};
async function getSettings() {
    const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].setting.findMany();
    const map = new Map(rows.map((r)=>[
            r.key,
            r.value
        ]));
    return {
        leverage: map.has("leverage") ? parseInt(map.get("leverage"), 10) : DEFAULT_SETTINGS.leverage,
        positionSizePct: map.has("positionSizePct") ? parseFloat(map.get("positionSizePct")) : DEFAULT_SETTINGS.positionSizePct,
        takeProfitPct: map.has("takeProfitPct") ? parseFloat(map.get("takeProfitPct")) : DEFAULT_SETTINGS.takeProfitPct,
        stopLossPct: map.has("stopLossPct") ? parseFloat(map.get("stopLossPct")) : DEFAULT_SETTINGS.stopLossPct,
        tradingEnabled: map.has("tradingEnabled") ? map.get("tradingEnabled") === "true" : DEFAULT_SETTINGS.tradingEnabled,
        telegramChannel: map.has("telegramChannel") ? map.get("telegramChannel") : DEFAULT_SETTINGS.telegramChannel,
        pollIntervalSec: map.has("pollIntervalSec") ? parseInt(map.get("pollIntervalSec"), 10) : DEFAULT_SETTINGS.pollIntervalSec,
        checkIntervalSec: map.has("checkIntervalSec") ? parseInt(map.get("checkIntervalSec"), 10) : DEFAULT_SETTINGS.checkIntervalSec
    };
}
async function updateSettings(patch) {
    for (const [key, value] of Object.entries(patch)){
        const strVal = typeof value === "boolean" ? value ? "true" : "false" : String(value);
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].setting.upsert({
            where: {
                key
            },
            update: {
                value: strVal
            },
            create: {
                key,
                value: strVal
            }
        });
    }
    return getSettings();
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/api/settings/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "PUT",
    ()=>PUT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/settings.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
async function GET() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSettings"])());
}
async function PUT(request) {
    try {
        const body = await request.json();
        // Валидация
        if (body.leverage !== undefined) {
            const v = Number(body.leverage);
            if (v < 1 || v > 125) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "leverage must be 1-125"
            }, {
                status: 400
            });
            body.leverage = v;
        }
        if (body.positionSizePct !== undefined) {
            const v = Number(body.positionSizePct);
            if (v < 0.1 || v > 100) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "positionSizePct must be 0.1-100"
            }, {
                status: 400
            });
            body.positionSizePct = v;
        }
        if (body.takeProfitPct !== undefined) {
            const v = Number(body.takeProfitPct);
            if (v < 0.01 || v > 1000) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "takeProfitPct must be 0.01-1000"
            }, {
                status: 400
            });
            body.takeProfitPct = v;
        }
        if (body.stopLossPct !== undefined) {
            const v = Number(body.stopLossPct);
            if (v < 0.01 || v > 100) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "stopLossPct must be 0.01-100"
            }, {
                status: 400
            });
            body.stopLossPct = v;
        }
        if (body.pollIntervalSec !== undefined) {
            const v = Number(body.pollIntervalSec);
            if (v < 5 || v > 3600) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "pollIntervalSec must be 5-3600"
            }, {
                status: 400
            });
            body.pollIntervalSec = v;
        }
        if (body.checkIntervalSec !== undefined) {
            const v = Number(body.checkIntervalSec);
            if (v < 2 || v > 600) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "checkIntervalSec must be 2-600"
            }, {
                status: 400
            });
            body.checkIntervalSec = v;
        }
        const updated = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateSettings"])(body);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(updated);
    } catch (e) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: e.message
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__b91dcca0._.js.map