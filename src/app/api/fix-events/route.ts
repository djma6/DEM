import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const added: string[] = [];
  const statements: { name: string; sql: string }[] = [
    { name: "musician_name", sql: `add column if not exists musician_name text` },
    { name: "musician_instrument", sql: `add column if not exists musician_instrument text` },
    { name: "musician_phone", sql: `add column if not exists musician_phone text` },
    { name: "musician_fee", sql: `add column if not exists musician_fee bigint not null default 0` },
    { name: "colleague_name", sql: `add column if not exists colleague_name text` },
    { name: "colleague_role", sql: `add column if not exists colleague_role text` },
    { name: "colleague_phone", sql: `add column if not exists colleague_phone text` },
    { name: "colleague_fee", sql: `add column if not exists colleague_fee bigint not null default 0` },
    { name: "sound_light_provider_phone", sql: `add column if not exists sound_light_provider_phone text` },
    { name: "musicians_json", sql: `add column if not exists musicians_json text` },
    { name: "providers_json", sql: `add column if not exists providers_json text` },
    { name: "colleagues_json", sql: `add column if not exists colleagues_json text` },
  ];

  for (const stmt of statements) {
    try {
      await db.execute(sql.raw(`alter table events ${stmt.sql}`)).catch(() => {});
      added.push(stmt.name);
    } catch {
      // column may already exist; ignore
      added.push(`${stmt.name} (skipped)`);
    }
  }

  try {
    const count = await db.execute(sql`select count(*) as n from events`);
    return NextResponse.json({
      ok: true,
      addedOrChecked: added,
      totalEvents: (count.rows[0] as { n: string }).n,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e), addedOrChecked: added },
      { status: 500 }
    );
  }
}
