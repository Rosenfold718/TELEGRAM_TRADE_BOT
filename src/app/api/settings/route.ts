import { NextResponse } from "next/server";
import { getSettings, updateSettings, AppSettings } from "@/lib/settings";

export async function GET() {
  return NextResponse.json(await getSettings());
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Partial<AppSettings>;
    // Валидация
    if (body.leverage !== undefined) {
      const v = Number(body.leverage);
      if (v < 1 || v > 125) return NextResponse.json({ error: "leverage must be 1-125" }, { status: 400 });
      body.leverage = v;
    }
    if (body.positionSizePct !== undefined) {
      const v = Number(body.positionSizePct);
      if (v < 0.1 || v > 100) return NextResponse.json({ error: "positionSizePct must be 0.1-100" }, { status: 400 });
      body.positionSizePct = v;
    }
    if (body.takeProfitPct !== undefined) {
      const v = Number(body.takeProfitPct);
      if (v < 0.01 || v > 1000) return NextResponse.json({ error: "takeProfitPct must be 0.01-1000" }, { status: 400 });
      body.takeProfitPct = v;
    }
    if (body.stopLossPct !== undefined) {
      const v = Number(body.stopLossPct);
      if (v < 0.01 || v > 100) return NextResponse.json({ error: "stopLossPct must be 0.01-100" }, { status: 400 });
      body.stopLossPct = v;
    }
    if (body.pollIntervalSec !== undefined) {
      const v = Number(body.pollIntervalSec);
      if (v < 5 || v > 3600) return NextResponse.json({ error: "pollIntervalSec must be 5-3600" }, { status: 400 });
      body.pollIntervalSec = v;
    }
    if (body.checkIntervalSec !== undefined) {
      const v = Number(body.checkIntervalSec);
      if (v < 2 || v > 600) return NextResponse.json({ error: "checkIntervalSec must be 2-600" }, { status: 400 });
      body.checkIntervalSec = v;
    }
    const updated = await updateSettings(body);
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
