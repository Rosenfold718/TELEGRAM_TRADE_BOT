module.exports = [
"[project]/src/lib/telegram-mtproto.ts [app-route] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/node_modules_telegram_d40543cd._.js",
  "server/chunks/node_modules_pako_6b6e2b67._.js",
  "server/chunks/[root-of-the-server]__6aff3cda._.js",
  "server/chunks/[root-of-the-server]__cba27efd._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/src/lib/telegram-mtproto.ts [app-route] (ecmascript)");
    });
});
}),
];