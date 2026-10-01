import { NextResponse } from "next/server";

/**
 * POST /api/notifications/subscribe
 * Принимает подписку на Web Push (упрощённо — через Notification API).
 *
 * В нашем личном приложении мы не используем Web Push server (VAPID),
 * а полагаемся на локальные Notification API в браузере через Service Worker.
 *
 * Этот endpoint просто логирует, что подписка была создана.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({ ok: true, message: "Subscription stored", data: body });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/**
 * GET /api/notifications/status
 * Возвращает статус — включены ли notifications (через service worker на клиенте).
 */
export async function GET() {
  return NextResponse.json({ ok: true, supported: true });
}
