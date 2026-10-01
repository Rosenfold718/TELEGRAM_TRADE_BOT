import { NextResponse } from "next/server";
import { worker } from "@/lib/worker";

export async function GET() {
  return NextResponse.json(worker.getStatus());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const action = (body.action as string) || "";

  if (action === "start") {
    worker.start();
    return NextResponse.json({ ok: true, status: worker.getStatus() });
  }
  if (action === "stop") {
    worker.stop();
    return NextResponse.json({ ok: true, status: worker.getStatus() });
  }
  if (action === "poll") {
    // принудительный single poll (для теста)
    return NextResponse.json({ ok: true, message: "Use /api/worker/poll for manual poll" });
  }
  if (action === "killall") {
    const result = await worker.closeAllPositions();
    return NextResponse.json({ ok: true, ...result });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
