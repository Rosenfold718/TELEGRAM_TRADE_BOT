import { NextResponse } from "next/server";
import { fetchChannelMessages } from "@/lib/telegram";
import { parseSignal, isTradingSignal } from "@/lib/parser";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const channel = body.channel || process.env.TELEGRAM_CHANNEL || "cryptoalr";

    const messages = await fetchChannelMessages(channel, { limit: 10 });
    const results = messages.map((m) => {
      const parsed = parseSignal(m.text);
      return {
        id: m.id,
        isSignal: isTradingSignal(parsed),
        parsed,
        text: m.text.slice(0, 200),
      };
    });

    const signals = results.filter((r) => r.isSignal);

    return NextResponse.json({
      ok: true,
      channel,
      totalMessages: messages.length,
      totalSignals: signals.length,
      results: results.slice(-10),
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
