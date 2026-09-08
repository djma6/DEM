import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { soundProviders } from "@/db/schema";
import { desc, sql } from "drizzle-orm";

async function ensureTable() {
  await db.execute(sql`
    create table if not exists sound_providers (
      id serial primary key,
      name text not null,
      phone text not null,
      cost bigint not null default 0,
      equipment text,
      notes text,
      created_at timestamp default now(),
      updated_at timestamp default now()
    )
  `);
}

export async function GET() {
  try {
    await ensureTable();
    const rows = await db.select().from(soundProviders).orderBy(desc(soundProviders.createdAt));
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching sound providers:", error);
    return NextResponse.json({ error: "Failed to fetch providers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body?.name ?? "").trim();
    const phone = String(body?.phone ?? "").trim();

    if (!name || !phone) {
      return NextResponse.json(
        { error: "name and phone are required" },
        { status: 400 }
      );
    }

    await ensureTable();
    const rows = await db
      .insert(soundProviders)
      .values({
        name,
        phone,
        cost: Number(body?.cost) || 0,
        equipment: body?.equipment ? String(body.equipment) : null,
        notes: body?.notes ? String(body.notes) : null,
      })
      .returning();

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating sound provider:", error);
    return NextResponse.json(
      {
        error: "Failed to create provider",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
