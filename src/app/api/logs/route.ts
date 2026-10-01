import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get("level"); // INFO/WARN/ERROR
    const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 500);

    const where: any = {};
    if (level) where.level = level;

    const logs = await db.log.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ logs });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
