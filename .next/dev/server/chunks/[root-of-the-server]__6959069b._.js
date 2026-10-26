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
"[project]/src/app/api/binance/account/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$binance$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/binance.ts [app-route] (ecmascript)");
;
;
async function GET() {
    try {
        const configured = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$binance$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isBinanceConfigured"])();
        const connectivity = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$binance$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["testConnectivity"])();
        if (!connectivity.ok) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                configured,
                demo: !configured,
                testnet: connectivity.testnet,
                connectivity,
                balance: [],
                positions: [],
                summary: {
                    usdtWallet: 0,
                    usdtAvailable: 0,
                    usdtMargin: 0,
                    unrealizedPnl: 0,
                    openPositionsCount: 0
                },
                error: connectivity.error
            });
        }
        const [balance, positions] = await Promise.all([
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$binance$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAccountBalance"])(),
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$binance$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPositions"])()
        ]);
        const usdt = balance.find((b)=>b.asset === "USDT");
        const unrealizedPnl = positions.reduce((acc, p)=>acc + p.unRealizedProfit, 0);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            configured,
            demo: !configured,
            testnet: connectivity.testnet,
            connectivity,
            balance,
            positions,
            summary: {
                usdtWallet: usdt?.walletBalance || 0,
                usdtAvailable: usdt?.availableBalance || 0,
                usdtMargin: usdt?.marginBalance || 0,
                unrealizedPnl,
                openPositionsCount: positions.length
            }
        });
    } catch (e) {
        console.error("[api/binance/account] error:", e);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            configured: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$binance$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isBinanceConfigured"])(),
            demo: !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$binance$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isBinanceConfigured"])(),
            error: e.message,
            balance: [],
            positions: [],
            summary: {
                usdtWallet: 0,
                usdtAvailable: 0,
                usdtMargin: 0,
                unrealizedPnl: 0,
                openPositionsCount: 0
            }
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__6959069b._.js.map