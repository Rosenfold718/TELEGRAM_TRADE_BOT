import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const onlySignals = searchParams.get("onlySignals") === "true";
    const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 500);

    const where: any = {};
    if (onlySignals) where.isPumpSignal = true;

    const signals = await db.signal.findMany({
      where,
      include: { trade: true },
      orderBy: { detectedAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ signals });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
