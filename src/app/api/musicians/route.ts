import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { musicians } from "@/db/schema";
import { desc, sql } from "drizzle-orm";

async function ensureTable() {
  await db.execute(sql`
    create table if not exists musicians (
      id serial primary key,
      full_name text not null,
      instrument text not null,
      phone text not null,
      fee bigint not null default 0,
      notes text,
      created_at timestamp default now(),
      updated_at timestamp default now()
    )
  `);
}

export async function GET() {
  try {
    await ensureTable();
    const rows = await db.select().from(musicians).orderBy(desc(musicians.createdAt));
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching musicians:", error);
    return NextResponse.json({ error: "Failed to fetch musicians" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const fullName = String(body?.fullName ?? "").trim();
    const instrument = String(body?.instrument ?? "").trim();
    const phone = String(body?.phone ?? "").trim();

    if (!fullName || !instrument || !phone) {
      return NextResponse.json(
        { error: "fullName, instrument and phone are required" },
        { status: 400 }
      );
    }

    await ensureTable();
    const rows = await db
      .insert(musicians)
      .values({
        fullName,
        instrument,
        phone,
        fee: Number(body?.fee) || 0,
        notes: body?.notes ? String(body.notes) : null,
      })
      .returning();

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating musician:", error);
    return NextResponse.json(
      {
        error: "Failed to create musician",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
