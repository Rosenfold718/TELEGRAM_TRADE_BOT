module.exports = [
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/constants [external] (constants, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("constants", () => require("constants"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[project]/src/lib/telegram-mtproto.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fetchChannelMessagesMTProto",
    ()=>fetchChannelMessagesMTProto,
    "fetchNewMessagesMTProto",
    ()=>fetchNewMessagesMTProto,
    "getTelegramClient",
    ()=>getTelegramClient,
    "getTelegramMethod",
    ()=>getTelegramMethod,
    "isTelegramConfigured",
    ()=>isTelegramConfigured,
    "testTelegramConnection",
    ()=>testTelegramConnection
]);
/**
 * Telegram MTProto клиент через GramJS.
 * Позволяет читать ЛЮБЫЕ каналы, где состоит твой аккаунт (включая @cryptoalr).
 *
 * Требует:
 *  - TELEGRAM_API_ID (получить на https://my.telegram.org → API development tools)
 *  - TELEGRAM_API_HASH
 *  - TELEGRAM_SESSION (StringSession — генерируется один раз через scripts/telegram-login.ts)
 *
 * Документация: https://gram.js.org/
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$telegram$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/telegram/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$telegram$2f$sessions$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/telegram/sessions/index.js [app-route] (ecmascript)");
;
;
;
let clientInstance = null;
let clientReady = false;
function isTelegramConfigured() {
    return Boolean(process.env.TELEGRAM_API_ID && process.env.TELEGRAM_API_HASH && process.env.TELEGRAM_SESSION);
}
function getTelegramMethod() {
    const m = process.env.TELEGRAM_METHOD || "mtproto";
    if (m === "scrape" || m === "mtproto") return m;
    return "mtproto";
}
async function getTelegramClient() {
    if (!isTelegramConfigured()) return null;
    if (clientInstance && clientReady) return clientInstance;
    const apiId = parseInt(process.env.TELEGRAM_API_ID, 10);
    const apiHash = process.env.TELEGRAM_API_HASH;
    const sessionString = process.env.TELEGRAM_SESSION;
    const session = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$telegram$2f$sessions$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["StringSession"](sessionString);
    const client = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$telegram$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TelegramClient"](session, apiId, apiHash, {
        connectionRetries: 5,
        useWSS: true
    });
    try {
        await client.connect();
        clientInstance = client;
        clientReady = true;
        console.log("[telegram] MTProto client connected");
        return client;
    } catch (e) {
        console.error("[telegram] MTProto connect failed:", e.message);
        clientReady = false;
        return null;
    }
}
async function fetchChannelMessagesMTProto(channelName, limit = 20) {
    const client = await getTelegramClient();
    if (!client) {
        throw new Error("Telegram MTProto client not configured");
    }
    // 1. Резолвим username → Entity
    const entity = await client.getEntity(channelName);
    // 2. Запрашиваем последние N сообщений (включая текст, дату, просмотры)
    const messages = await client.getMessages(entity, {
        limit
    });
    // 3. Получаем ID канала для построения URL
    let channelId = null;
    if (entity instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$telegram$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Api"].Channel) {
        channelId = String(entity.id);
    } else if (entity instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$telegram$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Api"].Chat) {
        channelId = String(entity.id);
    }
    return messages.filter((m)=>m && m.message) // пропускаем сервисные сообщения без текста
    .map((m)=>{
        const text = m.message || "";
        const id = Number(m.id);
        const url = channelId !== null ? `https://t.me/c/${channelId}/${id}` : `https://t.me/${channelName}/${id}`;
        const date = m.date ? new Date(m.date * 1000) : null;
        return {
            id,
            channelName,
            text,
            url,
            datetime: date ? date.toISOString() : null,
            timestamp: date ? date.getTime() : null,
            views: m.views ? Number(m.views) : null
        };
    });
}
async function fetchNewMessagesMTProto(channelName, afterMessageId, limit = 50) {
    const client = await getTelegramClient();
    if (!client) {
        throw new Error("Telegram MTProto client not configured");
    }
    const entity = await client.getEntity(channelName);
    // minId — получить сообщения с id > afterMessageId
    const messages = await client.getMessages(entity, {
        limit,
        minId: afterMessageId
    });
    let channelId = null;
    if (entity instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$telegram$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Api"].Channel) {
        channelId = String(entity.id);
    } else if (entity instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$telegram$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Api"].Chat) {
        channelId = String(entity.id);
    }
    return messages.filter((m)=>m && m.message).map((m)=>{
        const text = m.message || "";
        const id = Number(m.id);
        const url = channelId !== null ? `https://t.me/c/${channelId}/${id}` : `https://t.me/${channelName}/${id}`;
        const date = m.date ? new Date(m.date * 1000) : null;
        return {
            id,
            channelName,
            text,
            url,
            datetime: date ? date.toISOString() : null,
            timestamp: date ? date.getTime() : null,
            views: m.views ? Number(m.views) : null
        };
    }).sort((a, b)=>a.id - b.id);
}
async function testTelegramConnection() {
    if (!isTelegramConfigured()) {
        return {
            ok: false,
            configured: false,
            method: getTelegramMethod()
        };
    }
    try {
        const client = await getTelegramClient();
        if (!client) {
            return {
                ok: false,
                configured: true,
                method: "mtproto",
                error: "Client init failed"
            };
        }
        const me = await client.getMe();
        return {
            ok: true,
            configured: true,
            method: "mtproto",
            me: {
                id: String(me.id),
                firstName: me.firstName || "",
                lastName: me.lastName,
                username: me.username
            }
        };
    } catch (e) {
        return {
            ok: false,
            configured: true,
            method: "mtproto",
            error: e.message
        };
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__cba27efd._.js.map