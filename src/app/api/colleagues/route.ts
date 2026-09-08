import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { colleagues } from "@/db/schema";
import { desc, sql } from "drizzle-orm";

const VALID_ROLES = ["dj", "showman", "singer", "vipMusic"];

async function ensureTable() {
  await db.execute(sql`
    create table if not exists colleagues (
      id serial primary key,
      full_name text not null,
      role text not null default 'dj',
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
    const rows = await db.select().from(colleagues).orderBy(desc(colleagues.createdAt));
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching colleagues:", error);
    return NextResponse.json({ error: "Failed to fetch colleagues" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const fullName = String(body?.fullName ?? "").trim();
    const phone = String(body?.phone ?? "").trim();
    const role = VALID_ROLES.includes(body?.role) ? body.role : "dj";

    if (!fullName || !phone) {
      return NextResponse.json(
        { error: "fullName and phone are required" },
        { status: 400 }
      );
    }

    await ensureTable();
    const rows = await db
      .insert(colleagues)
      .values({
        fullName,
        role,
        phone,
        fee: Number(body?.fee) || 0,
        notes: body?.notes ? String(body.notes) : null,
      })
      .returning();

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating colleague:", error);
    return NextResponse.json(
      {
        error: "Failed to create colleague",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
