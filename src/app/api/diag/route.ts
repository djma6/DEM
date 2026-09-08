import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cols = await db.execute(sql`
      select column_name
      from information_schema.columns
      where table_name = 'events'
      order by ordinal_position
    `);
    const names = (cols.rows as { column_name: string }[]).map(r => r.column_name);
    const required = ["musicians_json", "providers_json", "colleagues_json"];
    return NextResponse.json({
      columns: names,
      missingJsonColumns: required.filter(c => !names.includes(c)),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
