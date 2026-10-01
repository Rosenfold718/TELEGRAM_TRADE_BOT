import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = (searchParams.get("status") || "all").toUpperCase(); // OPEN | CLOSED | ALL
    const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 500);

    const where: any = {};
    if (status !== "ALL") where.status = status;

    const trades = await db.trade.findMany({
      where,
      include: { signal: true },
      orderBy: { openedAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ trades });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
