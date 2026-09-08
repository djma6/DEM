import { NextResponse } from "next/server";
import { db } from "@/db";
import { events } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Force the exact drizzle path the GET route uses
    const result = await db
      .select()
      .from(events)
      .orderBy(desc(events.gregorianDate));
    return NextResponse.json({
      ok: true,
      rowsReturned: result.length,
      firstEventKeys: result[0] ? Object.keys(result[0]) : [],
    });
  } catch (e) {
    const err = e as Record<string, unknown>;
    const cause = err?.cause as Record<string, unknown> | undefined;
    return NextResponse.json(
      {
        ok: false,
        message: e instanceof Error ? e.message : String(e),
        causeMessage: cause?.message || null,
        causeCode: cause?.code || null,
        query: err?.query || null,
        params: err?.params || null,
      },
      { status: 500 }
    );
  }
}
