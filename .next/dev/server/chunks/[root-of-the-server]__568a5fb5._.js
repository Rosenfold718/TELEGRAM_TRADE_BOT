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
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/src/lib/cache.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Простой in-memory кэш для Binance API запросов.
 * Бережёт rate limit (Binance бане IP при превышении weight).
 *
 * По умолчанию кэширует на 30 секунд. Для баланса — на 15 секунд,
 * для цен — на 5 секунд.
 */ __turbopack_context__.s([
    "cached",
    ()=>cached,
    "clearCache",
    ()=>clearCache
]);
const cache = new Map();
async function cached(key, ttlMs, fn) {
    const entry = cache.get(key);
    if (entry && entry.expiresAt > Date.now()) {
        return entry.data;
    }
    const data = await fn();
    cache.set(key, {
        data,
        expiresAt: Date.now() + ttlMs
    });
    return data;
}
function clearCache(prefix) {
    if (!prefix) {
        cache.clear();
        return;
    }
    for (const key of cache.keys()){
        if (key.startsWith(prefix)) cache.delete(key);
    }
}
}),
"[project]/src/lib/binance.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "closePosition",
    ()=>closePosition,
    "getAccountBalance",
    ()=>getAccountBalance,
    "getPositions",
    ()=>getPositions,
    "getSymbolInfo",
    ()=>getSymbolInfo,
    "getTickerPrice",
    ()=>getTickerPrice,
    "isBinanceConfigured",
    ()=>isBinanceConfigured,
    "placeMarketOrder",
    ()=>placeMarketOrder,
    "setLeverage",
    ()=>setLeverage,
    "testConnectivity",
    ()=>testConnectivity
]);
/**
 * Binance USDT-M Futures REST API клиент.
 * Поддерживает mainnet, testnet и DEMO режим (mock данные когда нет API ключей).
 *
 * Документация: https://binance-docs.github.io/apidocs/futures/en/
 *
 * Endpoints:
 *  - Mainnet: https://fapi.binance.com
 *  - Testnet:  https://testnet.binancefuture.com
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/cache.ts [app-route] (ecmascript)");
;
;
const MAINNET_BASE = "https://fapi.binance.com";
const TESTNET_BASE = "https://testnet.binancefuture.com";
// ===== Утилиты =====
function getBaseUrl() {
    const testnet = process.env.BINANCE_TESTNET === "true";
    return testnet ? TESTNET_BASE : MAINNET_BASE;
}
function isBinanceConfigured() {
    return Boolean(process.env.BINANCE_API_KEY && process.env.BINANCE_API_SECRET);
}
function sign(queryString, secret) {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHmac("sha256", secret).update(queryString).digest("hex");
}
function buildQuery(params) {
    return Object.entries(params).filter(([, v])=>v !== undefined && v !== "").map(([k, v])=>`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join("&");
}
async function binanceRequest(path, params = {}, method = "GET", signed = false) {
    const apiKey = process.env.BINANCE_API_KEY;
    const apiSecret = process.env.BINANCE_API_SECRET;
    if (signed && (!apiKey || !apiSecret)) {
        throw new Error("Binance API keys не настроены. Добавь BINANCE_API_KEY и BINANCE_API_SECRET в .env");
    }
    const timestamp = Date.now();
    let query = buildQuery({
        ...params,
        timestamp
    });
    if (signed) {
        query = buildQuery({
            ...params,
            timestamp,
            recvWindow: 5000
        });
        query += `&signature=${sign(query, apiSecret)}`;
    }
    const url = signed ? `${getBaseUrl()}${path}?${query}` : `${getBaseUrl()}${path}${query ? `?${query}` : ""}`;
    const headers = {
        "Content-Type": "application/json"
    };
    if (apiKey) headers["X-MBX-APIKEY"] = apiKey;
    const response = await fetch(url, {
        method,
        headers
    });
    if (!response.ok) {
        const text = await response.text();
        let errMsg = text;
        try {
            const j = JSON.parse(text);
            errMsg = j.msg || text;
        } catch  {}
        throw new Error(`Binance API ${response.status}: ${errMsg}`);
    }
    return response.json();
}
// ===== DEMO режим (mock данные) =====
const DEMO_BALANCES = [
    {
        asset: "USDT",
        walletBalance: 12500.42,
        availableBalance: 11800.42,
        marginBalance: 700.0,
        maxWithdrawAmount: 11800.42,
        crossWalletBalance: 12500.42
    },
    {
        asset: "BNB",
        walletBalance: 12.45,
        availableBalance: 12.45,
        marginBalance: 0,
        maxWithdrawAmount: 12.45,
        crossWalletBalance: 0
    }
];
const DEMO_PRICES = {
    BTCUSDT: 67850.5,
    ETHUSDT: 3285.4,
    SOLUSDT: 178.23,
    BNBUSDT: 612.8,
    USUSDT: 0.02118,
    PEPEUSDT: 0.0000098,
    DOGEUSDT: 0.1342,
    XRPUSDT: 0.5671,
    ADAUSDT: 0.4123,
    AVAXUSDT: 32.45,
    ARBUSDT: 0.8521,
    SUIUSDT: 1.8234,
    APTUSDT: 8.512,
    OPUSDT: 1.952,
    INJUSDT: 23.51,
    TIAUSDT: 6.234
};
const DEMO_SYMBOLS = Object.keys(DEMO_PRICES).map((symbol)=>({
        symbol,
        status: "TRADING",
        baseAsset: symbol.replace("USDT", ""),
        quoteAsset: "USDT",
        pricePrecision: 4,
        quantityPrecision: 0,
        minQty: 1,
        stepSize: 1,
        tickSize: 0.0001
    }));
function demoPrice(symbol) {
    if (DEMO_PRICES[symbol]) {
        // добавим лёгкий шум для динамики
        const base = DEMO_PRICES[symbol];
        const noise = (Math.random() - 0.5) * base * 0.005;
        return base + noise;
    }
    // неизвестный символ — сгенерируем правдоподобную цену
    return 0.001 + Math.random() * 10;
}
async function getSymbolInfo(symbol) {
    if (!isBinanceConfigured()) {
        return DEMO_SYMBOLS.find((s)=>s.symbol === symbol.toUpperCase()) || null;
    }
    try {
        const symbolsMap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cached"])("binance:exchangeInfo", 5 * 60_000, async ()=>{
            const data = await binanceRequest("/fapi/v1/exchangeInfo");
            const map = new Map();
            for (const s of data.symbols){
                map.set(s.symbol, s);
            }
            return map;
        });
        const found = symbolsMap.get(symbol.toUpperCase());
        if (!found) return null;
        const priceFilter = found.filters?.find((f)=>f.filterType === "PRICE_FILTER");
        const lotSize = found.filters?.find((f)=>f.filterType === "LOT_SIZE");
        return {
            symbol: found.symbol,
            status: found.status,
            baseAsset: found.baseAsset,
            quoteAsset: found.quoteAsset,
            pricePrecision: found.pricePrecision,
            quantityPrecision: found.quantityPrecision,
            minQty: parseFloat(lotSize?.minQty || "1"),
            stepSize: parseFloat(lotSize?.stepSize || "1"),
            tickSize: parseFloat(priceFilter?.tickSize || "0.0001")
        };
    } catch (e) {
        console.error("[binance] getSymbolInfo error:", e);
        return null;
    }
}
async function getTickerPrice(symbol) {
    if (!isBinanceConfigured()) {
        return {
            symbol,
            price: demoPrice(symbol),
            time: Date.now()
        };
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cached"])(`binance:ticker:${symbol.toUpperCase()}`, 5_000, async ()=>{
        const data = await binanceRequest("/fapi/v1/ticker/price", {
            symbol
        });
        return {
            symbol: data.symbol,
            price: parseFloat(data.price),
            time: data.time
        };
    });
}
async function getAccountBalance() {
    if (!isBinanceConfigured()) {
        // в демо: лёгкое случайное колебание
        return DEMO_BALANCES.map((b)=>({
                ...b,
                walletBalance: b.walletBalance + (Math.random() - 0.5) * 50,
                availableBalance: b.availableBalance + (Math.random() - 0.5) * 50
            }));
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cached"])("binance:balance", 15_000, async ()=>{
        const data = await binanceRequest("/fapi/v2/balance", {}, "GET", true);
        return data.map((d)=>({
                asset: d.asset,
                walletBalance: d.walletBalance !== null ? parseFloat(d.walletBalance) : 0,
                availableBalance: d.availableBalance !== null ? parseFloat(d.availableBalance) : 0,
                marginBalance: d.marginBalance !== null ? parseFloat(d.marginBalance) : 0,
                maxWithdrawAmount: d.maxWithdrawAmount !== null ? parseFloat(d.maxWithdrawAmount) : 0,
                crossWalletBalance: d.crossWalletBalance !== null ? parseFloat(d.crossWalletBalance) : 0
            })).filter((b)=>b.walletBalance > 0 || b.availableBalance > 0 || b.marginBalance > 0);
    });
}
async function getPositions() {
    if (!isBinanceConfigured()) {
        // вернём случайные открытые позиции для демо
        const demoSymbols = [
            "BTCUSDT",
            "ETHUSDT",
            "SOLUSDT"
        ];
        return demoSymbols.map((symbol)=>{
            const price = demoPrice(symbol);
            const qty = (Math.random() > 0.5 ? 1 : -1) * (0.05 + Math.random() * 0.3);
            const entry = price * (1 + (Math.random() - 0.5) * 0.02);
            const uPnL = (price - entry) * qty;
            return {
                symbol,
                positionAmt: qty,
                entryPrice: entry,
                markPrice: price,
                unRealizedProfit: uPnL,
                liquidationPrice: entry * (1 - 0.05),
                leverage: 20,
                maxNotionalValue: Math.abs(entry * qty),
                positionSide: "BOTH"
            };
        });
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cached"])("binance:positions", 10_000, async ()=>{
        const data = await binanceRequest("/fapi/v2/positionRisk", {}, "GET", true);
        return data.filter((d)=>parseFloat(d.positionAmt) !== 0).map((d)=>({
                symbol: d.symbol,
                positionAmt: parseFloat(d.positionAmt),
                entryPrice: parseFloat(d.entryPrice),
                markPrice: parseFloat(d.markPrice),
                unRealizedProfit: parseFloat(d.unRealizedProfit),
                liquidationPrice: parseFloat(d.liquidationPrice),
                leverage: parseInt(d.leverage, 10),
                maxNotionalValue: parseFloat(d.maxNotionalValue),
                positionSide: d.positionSide
            }));
    });
}
async function setLeverage(symbol, leverage) {
    if (!isBinanceConfigured()) {
        return {
            symbol,
            leverage,
            maxNotionalValue: leverage * 1000
        };
    }
    return binanceRequest("/fapi/v1/leverage", {
        symbol,
        leverage
    }, "POST", true);
}
async function placeMarketOrder(params) {
    if (!isBinanceConfigured()) {
        return {
            orderId: `DEMO_${Date.now()}`,
            symbol: params.symbol,
            status: "FILLED",
            side: params.side,
            type: "MARKET",
            origQty: String(params.quantity),
            avgPrice: String(demoPrice(params.symbol)),
            executedQty: String(params.quantity),
            cumQuote: String(params.quantity * demoPrice(params.symbol)),
            clientOrderId: params.clientOrderId || `DEMO_${Date.now()}`,
            closePosition: false
        };
    }
    const body = {
        symbol: params.symbol,
        side: params.side,
        type: "MARKET",
        quantity: params.quantity,
        newClientOrderId: params.clientOrderId,
        reduceOnly: params.reduceOnly === true ? "true" : undefined
    };
    return binanceRequest("/fapi/v1/order", body, "POST", true);
}
async function closePosition(symbol, side) {
    // закрытие всей позиции через reduceOnly MARKET ордер
    const positions = await getPositions();
    const pos = positions.find((p)=>p.symbol === symbol);
    if (!pos || pos.positionAmt === 0) {
        throw new Error(`Нет открытой позиции по ${symbol}`);
    }
    const closeSide = side === "BUY" ? "SELL" : "BUY";
    const quantity = Math.abs(pos.positionAmt);
    return placeMarketOrder({
        symbol,
        side: closeSide,
        quantity,
        reduceOnly: true,
        clientOrderId: `CLOSE_${Date.now()}`
    });
}
async function testConnectivity() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cached"])("binance:ping", 30_000, async ()=>{
        const start = Date.now();
        try {
            if (!isBinanceConfigured()) {
                return {
                    ok: true,
                    testnet: false,
                    demo: true,
                    latencyMs: Date.now() - start
                };
            }
            await binanceRequest("/fapi/v1/ping");
            return {
                ok: true,
                testnet: process.env.BINANCE_TESTNET === "true",
                demo: false,
                latencyMs: Date.now() - start
            };
        } catch (e) {
            return {
                ok: false,
                testnet: false,
                demo: false,
                error: e.message
            };
        }
    });
}
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/string_decoder [external] (string_decoder, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("string_decoder", () => require("string_decoder"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/node:assert [external] (node:assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:assert", () => require("node:assert"));

module.exports = mod;
}),
"[externals]/node:net [external] (node:net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:net", () => require("node:net"));

module.exports = mod;
}),
"[externals]/node:http [external] (node:http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:http", () => require("node:http"));

module.exports = mod;
}),
"[externals]/node:querystring [external] (node:querystring, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:querystring", () => require("node:querystring"));

module.exports = mod;
}),
"[externals]/node:events [external] (node:events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:events", () => require("node:events"));

module.exports = mod;
}),
"[externals]/node:diagnostics_channel [external] (node:diagnostics_channel, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:diagnostics_channel", () => require("node:diagnostics_channel"));

module.exports = mod;
}),
"[externals]/node:util [external] (node:util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:util", () => require("node:util"));

module.exports = mod;
}),
"[externals]/node:tls [external] (node:tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:tls", () => require("node:tls"));

module.exports = mod;
}),
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:zlib [external] (node:zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:zlib", () => require("node:zlib"));

module.exports = mod;
}),
"[externals]/node:perf_hooks [external] (node:perf_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:perf_hooks", () => require("node:perf_hooks"));

module.exports = mod;
}),
"[externals]/node:util/types [external] (node:util/types, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:util/types", () => require("node:util/types"));

module.exports = mod;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[externals]/node:worker_threads [external] (node:worker_threads, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:worker_threads", () => require("node:worker_threads"));

module.exports = mod;
}),
"[externals]/node:http2 [external] (node:http2, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:http2", () => require("node:http2"));

module.exports = mod;
}),
"[externals]/node:url [external] (node:url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:url", () => require("node:url"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[externals]/node:console [external] (node:console, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:console", () => require("node:console"));

module.exports = mod;
}),
"[externals]/node:fs/promises [external] (node:fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs/promises", () => require("node:fs/promises"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[externals]/node:timers [external] (node:timers, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:timers", () => require("node:timers"));

module.exports = mod;
}),
"[externals]/node:dns [external] (node:dns, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:dns", () => require("node:dns"));

module.exports = mod;
}),
"[project]/src/lib/telegram-scrape.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fetchChannelMessages",
    ()=>fetchChannelMessages,
    "filterNewMessages",
    ()=>filterNewMessages,
    "parseMessages",
    ()=>parseMessages
]);
/**
 * Web scraper: парсит публичные сообщения канала через t.me/s/<channel>.
 *
 * ⚠️ Работает НЕ для всех каналов. Telegram может отдавать только preview-заглушку
 * (например, для каналов <100 подписчиков или с настройкой "Restrict forwarding").
 * Для надёжного чтения используй MTProto метод (telegram-mtproto.ts).
 *
 * Примеры URL:
 *  https://t.me/s/cryptoalr          — последние ~20 сообщений
 *  https://t.me/s/cryptoalr/68        — конкретное сообщение #68 и несколько соседних
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cheerio$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/cheerio/dist/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cheerio$2f$dist$2f$esm$2f$load$2d$parse$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/cheerio/dist/esm/load-parse.js [app-route] (ecmascript)");
;
async function fetchChannelMessages(channelName, options = {}) {
    let url = `https://t.me/s/${channelName}`;
    if (options.beforeId) {
        url += `/${options.beforeId}`;
    }
    const response = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9,ru;q=0.8",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        },
        cache: "no-store"
    });
    if (!response.ok) {
        throw new Error(`Telegram: HTTP ${response.status} для ${url}`);
    }
    const html = await response.text();
    return parseMessages(html, channelName);
}
function parseMessages(html, channelName) {
    const $ = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cheerio$2f$dist$2f$esm$2f$load$2d$parse$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["load"](html);
    const messages = [];
    $(".tgme_widget_message").each((_, el)=>{
        const $el = $(el);
        const post = $el.attr("data-post") || "";
        const match = post.match(/\/(\d+)$/);
        if (!match) return;
        const id = parseInt(match[1], 10);
        const $text = $el.find(".tgme_widget_message_text");
        const text = $text.text().trim();
        const htmlContent = $text.html() || "";
        const datetime = $el.find(".tgme_widget_message_date time").attr("datetime") || null;
        const timestamp = datetime ? Date.parse(datetime) : null;
        const url = `https://t.me/${channelName}/${id}`;
        const viewsText = $el.find(".tgme_widget_message_views").text().trim();
        const views = parseViews(viewsText);
        messages.push({
            id,
            channelName,
            text,
            html: htmlContent,
            url,
            datetime,
            timestamp,
            views
        });
    });
    messages.sort((a, b)=>a.id - b.id);
    return messages;
}
function parseViews(text) {
    if (!text) return null;
    let n = parseFloat(text.replace(/[KkMm]/g, ""));
    if (/K/i.test(text)) n *= 1_000;
    if (/M/i.test(text)) n *= 1_000_000;
    return n;
}
function filterNewMessages(messages, lastKnownId) {
    return messages.filter((m)=>m.id > lastKnownId);
}
}),
"[project]/src/lib/telegram.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fetchChannelMessages",
    ()=>fetchChannelMessages,
    "getNewMessages",
    ()=>getNewMessages,
    "getTelegramMethod",
    ()=>getTelegramMethod,
    "isTelegramConfigured",
    ()=>isTelegramConfigured,
    "testTelegramConnection",
    ()=>testTelegramConnection
]);
/**
 * Унифицированный интерфейс для получения сообщений из Telegram.
 * Поддерживает 2 метода (выбирается через TELEGRAM_METHOD):
 *   - "mtproto" — через User API (нужно TELEGRAM_API_ID + API_HASH + SESSION). Читает любые каналы.
 *   - "scrape"  — через t.me/s/<channel> (без авторизации, работает не для всех каналов)
 *
 * ВАЖНО: MTProto функции подгружаются динамически через import(),
 * чтобы GramJS не загружался при компиляции route handlers и worker
 * (иначе Next.js edge runtime может ломаться).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$telegram$2d$scrape$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/telegram-scrape.ts [app-route] (ecmascript)");
;
function getTelegramMethod() {
    const m = process.env.TELEGRAM_METHOD || "mtproto";
    if (m === "scrape" || m === "mtproto") return m;
    return "mtproto";
}
function isTelegramConfigured() {
    return Boolean(process.env.TELEGRAM_API_ID && process.env.TELEGRAM_API_HASH && process.env.TELEGRAM_SESSION);
}
async function fetchChannelMessages(channelName, options = {}) {
    const method = getTelegramMethod();
    if (method === "mtproto" && isTelegramConfigured()) {
        try {
            // Динамический импорт — GramJS загружается только при реальном использовании
            const { fetchChannelMessagesMTProto } = await __turbopack_context__.A("[project]/src/lib/telegram-mtproto.ts [app-route] (ecmascript, async loader)");
            const msgs = await fetchChannelMessagesMTProto(channelName, options.limit || 20);
            return msgs;
        } catch (e) {
            console.error("[telegram] MTProto fetch failed, fallback to scrape:", e.message);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$telegram$2d$scrape$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchChannelMessages"])(channelName, options);
        }
    }
    // default: web scraping
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$telegram$2d$scrape$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchChannelMessages"])(channelName, options);
}
function getNewMessages(messages, lastKnownId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$telegram$2d$scrape$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["filterNewMessages"])(messages, lastKnownId);
}
async function testTelegramConnection() {
    const method = getTelegramMethod();
    const configured = isTelegramConfigured();
    if (!configured) {
        return {
            ok: false,
            configured: false,
            method
        };
    }
    try {
        const { testTelegramConnection: test } = await __turbopack_context__.A("[project]/src/lib/telegram-mtproto.ts [app-route] (ecmascript, async loader)");
        return await test();
    } catch (e) {
        return {
            ok: false,
            configured: true,
            method,
            error: e.message
        };
    }
}
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
"[project]/src/app/api/health/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$binance$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/binance.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$telegram$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/telegram.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
async function GET() {
    const checks = {
        timestamp: new Date().toISOString(),
        components: {},
        checklist: []
    };
    // 1. BINANCE
    try {
        const binanceConfigured = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$binance$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isBinanceConfigured"])();
        const connectivity = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$binance$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["testConnectivity"])();
        checks.components.binance = {
            label: "Binance API (USDT-M Futures)",
            configured: binanceConfigured,
            mode: !binanceConfigured ? "DEMO" : process.env.BINANCE_TESTNET === "true" ? "TESTNET" : "LIVE",
            connected: connectivity.ok,
            latencyMs: connectivity.latencyMs,
            error: connectivity.error,
            status: !binanceConfigured ? "warning" : connectivity.ok ? "ok" : connectivity.error?.includes("banned") ? "banned" : "error",
            statusLabel: !binanceConfigured ? "Не настроено (DEMO)" : connectivity.ok ? `Подключено (${connectivity.latencyMs}ms)` : connectivity.error?.includes("banned") ? "IP заблокирован Binance" : `Ошибка: ${connectivity.error}`
        };
    } catch (e) {
        checks.components.binance = {
            status: "error",
            error: e.message
        };
    }
    // 2. TELEGRAM
    try {
        const telegramConfigured = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$telegram$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTelegramConfigured"])();
        const method = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$telegram$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTelegramMethod"])();
        let connection = {
            ok: false,
            configured: telegramConfigured
        };
        if (telegramConfigured && method === "mtproto") {
            connection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$telegram$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["testTelegramConnection"])();
        }
        checks.components.telegram = {
            label: "Telegram MTProto",
            configured: telegramConfigured,
            method,
            connected: connection.ok,
            me: connection.me || null,
            error: connection.error,
            status: !telegramConfigured ? "warning" : connection.ok ? "ok" : "error",
            statusLabel: !telegramConfigured ? `Не настроено (метод: ${method})` : connection.ok ? `Подключено как ${connection.me?.firstName || "user"}` : `Ошибка: ${connection.error}`
        };
    } catch (e) {
        checks.components.telegram = {
            status: "error",
            error: e.message
        };
    }
    // 3. DATABASE
    try {
        const databaseUrl = process.env.DATABASE_URL || "";
        const isTurso = databaseUrl.startsWith("libsql://") || databaseUrl.startsWith("libsqls://");
        // Сначала проверяем — доступен ли клиент БД вообще
        const dbAvailable = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isDbAvailable"])();
        let signalCount = 0, tradeCount = 0, settingCount = 0, logCount = 0;
        let dbConnected = false;
        let dbError = dbAvailable ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDbError"])();
        if (dbAvailable) {
            try {
                tradeCount = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].trade.count();
                signalCount = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].signal.count();
                settingCount = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].setting.count();
                logCount = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].log.count();
                dbConnected = true;
            } catch (e) {
                dbError = e.message;
            }
        }
        checks.components.database = {
            label: isTurso ? "Turso (libSQL)" : "Local SQLite",
            type: isTurso ? "turso" : "sqlite",
            url: databaseUrl ? `${databaseUrl.slice(0, 30)}...` : "(не задан)",
            connected: dbConnected,
            error: dbError,
            counts: {
                trades: tradeCount,
                signals: signalCount,
                settings: settingCount,
                logs: logCount
            },
            status: dbConnected ? "ok" : databaseUrl ? "error" : "warning",
            statusLabel: dbConnected ? `${isTurso ? "Turso" : "SQLite"} подключен (${tradeCount} trades, ${signalCount} signals)` : !databaseUrl ? "DATABASE_URL не задан (нужно добавить в Vercel env vars)" : `Ошибка: ${dbError}`
        };
    } catch (e) {
        checks.components.database = {
            status: "error",
            error: e.message
        };
    }
    // 4. WORKER
    checks.components.worker = {
        label: "Background Worker",
        pollIntervalSec: parseInt(process.env.WORKER_POLL_INTERVAL_SEC || "20", 10),
        checkIntervalSec: parseInt(process.env.WORKER_CHECK_INTERVAL_SEC || "5", 10),
        status: "ok",
        statusLabel: "Готов к запуску (нажми Start в UI)"
    };
    // 5. TRADING
    try {
        let tradingEnabled = process.env.TRADING_ENABLED === "true";
        try {
            const setting = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].setting.findUnique({
                where: {
                    key: "tradingEnabled"
                }
            });
            if (setting) tradingEnabled = setting.value === "true";
        } catch  {}
        checks.components.trading = {
            label: "Auto Trading",
            enabled: tradingEnabled,
            leverage: parseInt(process.env.DEFAULT_LEVERAGE || "75", 10),
            positionSizePct: parseFloat(process.env.DEFAULT_POSITION_SIZE_PCT || "5"),
            takeProfitPct: parseFloat(process.env.DEFAULT_TAKE_PROFIT_PCT || "10"),
            stopLossPct: parseFloat(process.env.DEFAULT_STOP_LOSS_PCT || "5"),
            status: tradingEnabled ? "ok" : "warning",
            statusLabel: tradingEnabled ? "Активна (сделки будут открываться)" : "Отключена (только мониторинг сигналов)"
        };
    } catch (e) {
        checks.components.trading = {
            status: "error",
            error: e.message
        };
    }
    // 6. Чек-лист — чего не хватает
    const checklist = [];
    const isBanned = checks.components.binance?.error?.includes("banned");
    checklist.push({
        id: "binance-keys",
        label: "Binance API ключи",
        status: checks.components.binance?.configured ? "done" : "pending",
        description: "Добавить BINANCE_API_KEY и BINANCE_API_SECRET в .env",
        action: "https://www.binance.com/en/my/settings/api-management"
    });
    checklist.push({
        id: "binance-ip",
        label: "Binance IP-фильтр",
        status: isBanned ? "warning" : checks.components.binance?.connected ? "done" : "pending",
        description: isBanned ? "IP забанен. Добавь свой IP в Binance API или используй Vercel/VPS" : "Добавить свой IP в Binance API Restrictions",
        action: "https://www.binance.com/en/my/settings/api-management"
    });
    checklist.push({
        id: "binance-futures",
        label: "Binance Futures Trading permission",
        status: "pending",
        description: "Включить галочку 'Enable Futures' в настройках API ключа (после IP-фильтра)",
        action: "https://www.binance.com/en/my/settings/api-management"
    });
    checklist.push({
        id: "tg-api",
        label: "Telegram api_id и api_hash",
        status: checks.components.telegram?.configured ? "done" : "pending",
        description: "Получить на my.telegram.org → API development tools",
        action: "https://my.telegram.org"
    });
    checklist.push({
        id: "tg-session",
        label: "Telegram session string",
        status: checks.components.telegram?.configured ? "done" : "pending",
        description: "Запустить bun run scripts/telegram-login.ts и скопировать session в .env"
    });
    checklist.push({
        id: "db",
        label: "База данных",
        status: checks.components.database?.connected ? "done" : "pending",
        description: "DATABASE_URL + DATABASE_AUTH_TOKEN в .env (Turso)",
        action: "https://turso.tech"
    });
    checklist.push({
        id: "db-migrate",
        label: "Миграция БД",
        status: checks.components.database?.connected ? "done" : "pending",
        description: "Запустить bun run scripts/turso-migrate.ts"
    });
    checklist.push({
        id: "trading-on",
        label: "Включить торговлю",
        status: checks.components.trading?.enabled ? "done" : "pending",
        description: "Переключить toggle 'Торговля включена' в Settings UI"
    });
    checklist.push({
        id: "worker-start",
        label: "Запустить Worker (24/7)",
        status: "pending",
        description: "Нажать 'Start' в Worker UI (или задеплоить на Vercel/VPS)"
    });
    checklist.push({
        id: "push",
        label: "Push-уведомления",
        status: "pending",
        description: "Нажать кнопку 'Push' в Worker UI и разрешить в браузере"
    });
    checks.checklist = checklist;
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(checks);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__568a5fb5._.js.map