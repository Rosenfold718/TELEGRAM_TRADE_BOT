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
"[project]/src/app/api/trades/stats/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
async function GET() {
    try {
        const trades = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].trade.findMany({
            where: {
                status: "CLOSED"
            },
            orderBy: {
                closedAt: "desc"
            }
        });
        const total = trades.length;
        const wins = trades.filter((t)=>(t.pnlUsd || 0) > 0).length;
        const losses = trades.filter((t)=>(t.pnlUsd || 0) < 0).length;
        const winRate = total > 0 ? wins / total * 100 : 0;
        const totalPnl = trades.reduce((acc, t)=>acc + (t.pnlUsd || 0), 0);
        const avgPnl = total > 0 ? totalPnl / total : 0;
        const bestTrade = trades.reduce((best, t)=>(t.pnlUsd || 0) > (best?.pnlUsd || -Infinity) ? t : best, null);
        const worstTrade = trades.reduce((worst, t)=>(t.pnlUsd || 0) < (worst?.pnlUsd || Infinity) ? t : worst, null);
        // P&L по дням (последние 30 дней)
        const dailyMap = new Map();
        for (const t of trades){
            if (!t.closedAt) continue;
            const day = t.closedAt.toISOString().slice(0, 10);
            dailyMap.set(day, (dailyMap.get(day) || 0) + (t.pnlUsd || 0));
        }
        const dailyPnl = Array.from(dailyMap.entries()).sort((a, b)=>a[0].localeCompare(b[0])).slice(-30).map(([day, pnl])=>({
                day,
                pnl: Number(pnl.toFixed(2))
            }));
        // Кумулятивный P&L
        let cum = 0;
        const cumulativePnl = dailyPnl.map((d)=>{
            cum += d.pnl;
            return {
                day: d.day,
                cumulative: Number(cum.toFixed(2))
            };
        });
        // Win/Loss distribution
        const winLossDist = {
            wins,
            losses,
            winRate: Number(winRate.toFixed(2))
        };
        // Win/Loss по символу
        const symbolMap = new Map();
        for (const t of trades){
            const s = symbolMap.get(t.symbol) || {
                count: 0,
                pnl: 0,
                wins: 0
            };
            s.count++;
            s.pnl += t.pnlUsd || 0;
            if ((t.pnlUsd || 0) > 0) s.wins++;
            symbolMap.set(t.symbol, s);
        }
        const bySymbol = Array.from(symbolMap.entries()).map(([symbol, v])=>({
                symbol,
                count: v.count,
                pnl: Number(v.pnl.toFixed(2)),
                winRate: v.count > 0 ? Number((v.wins / v.count * 100).toFixed(2)) : 0
            })).sort((a, b)=>b.pnl - a.pnl);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            totalTrades: total,
            wins,
            losses,
            winRate: Number(winRate.toFixed(2)),
            totalPnl: Number(totalPnl.toFixed(2)),
            avgPnl: Number(avgPnl.toFixed(2)),
            bestTrade: bestTrade ? {
                symbol: bestTrade.symbol,
                pnlUsd: Number((bestTrade.pnlUsd || 0).toFixed(2)),
                pnlPct: Number((bestTrade.pnlPct || 0).toFixed(2))
            } : null,
            worstTrade: worstTrade ? {
                symbol: worstTrade.symbol,
                pnlUsd: Number((worstTrade.pnlUsd || 0).toFixed(2)),
                pnlPct: Number((worstTrade.pnlPct || 0).toFixed(2))
            } : null,
            dailyPnl,
            cumulativePnl,
            winLossDist,
            bySymbol
        });
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

//# sourceMappingURL=%5Broot-of-the-server%5D__67720935._.js.map