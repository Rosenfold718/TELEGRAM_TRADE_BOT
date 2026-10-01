/**
 * Service Worker для локальных уведомлений.
 * Использует Notification API (не Web Push, чтобы избежать VAPID сложности для личного приложения).
 */

self.addEventListener("install", (event) => {
  console.log("[SW] installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[SW] activated");
  event.waitUntil(self.clients.claim());
});

// Обработка push-событий (для будущего Web Push)
self.addEventListener("push", (event) => {
  let data = { title: "Crypto Signal", body: "Новое уведомление" };
  try {
    if (event.data) data = event.data.json();
  } catch (e) {
    if (event.data) data.body = event.data.text();
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/logo.svg",
      badge: "/logo.svg",
      tag: "crypto-signal",
    })
  );
});

// Сообщения от клиента (для локальных уведомлений)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    const { title, body, tag } = event.data;
    event.waitUntil(
      self.registration.showNotification(title || "Crypto Signal", {
        body: body || "",
        icon: "/logo.svg",
        badge: "/logo.svg",
        tag: tag || "crypto-signal",
      })
    );
  }
});

// Клик по уведомлению — открываем приложение
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return self.clients.openWindow("/");
    })
  );
});
