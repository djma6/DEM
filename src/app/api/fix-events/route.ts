import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const out: Record<string, unknown> = {};
  try {
    // Add the three JSON columns safely (no JSON building, just columns).
    await db.execute(sql`
      alter table events
        add column if not exists musicians_json text,
        add column if not exists providers_json text,
        add column if not exists colleagues_json text
    `);
    out.addedColumns = true;

    const count = await db.execute(sql`select count(*) as n from events`);
    out.totalEvents = (count.rows[0] as { n: string }).n;
    return NextResponse.json({ ok: true, ...out });
  } catch (e) {
    return NextResponse.json(
      { ok: false, ...out, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
