import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * ONE-TIME migration helper.
 * Adds the three JSON columns to the existing events table AND restores
 * any single-row legacy data into the new JSON arrays. Never drops data.
 * Delete this file after you run it once.
 */
export async function GET() {
  const out: Record<string, unknown> = {};
  try {
    // 1) Add columns if they don't exist (no-op if already there)
    await db.execute(sql`
      alter table events
        add column if not exists musicians_json text,
        add column if not exists providers_json text,
        add column if not exists colleagues_json text
    `);
    out.addedColumns = true;

    // 2) Migrate single legacy rows into JSON arrays (idempotent)
    await db.execute(sql`
      update events set
        musicians_json = case
          when musicians_json is not null then musicians_json
          when musician_name is not null and musician_name <> '' then
            json_build_array(json_build_object(
              'name', musician_name,
              'instrument', coalesce(musician_instrument, ''),
              'phone', coalesce(musician_phone, ''),
              'fee', coalesce(musician_fee, 0)
            ))::text
          else musicians_json
        end,
        providers_json = case
          when providers_json is not null then providers_json
          when sound_light_provider is not null and sound_light_provider <> '' then
            json_build_array(json_build_object(
              'name', sound_light_provider,
              'phone', coalesce(sound_light_provider_phone, ''),
              'service', 'soundLight',
              'cost', coalesce(sound_light_cost, 0)
            ))::text
          else providers_json
        end,
        colleagues_json = case
          when colleagues_json is not null then colleagues_json
          when colleague_name is not null and colleague_name <> '' then
            json_build_array(json_build_object(
              'name', colleague_name,
              'role', coalesce(colleague_role, 'dj'),
              'phone', coalesce(colleague_phone, ''),
              'fee', coalesce(colleague_fee, 0)
            ))::text
          else colleagues_json
        end
    `);
    out.migratedLegacy = true;

    // 3) Return a count so you can see data is intact
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
