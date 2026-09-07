import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { desc, sql } from "drizzle-orm";

const VALID_CATEGORIES = ["ceremony", "restaurant", "club", "dj", "other"];

async function ensureTable() {
  await db.execute(sql`
    create table if not exists customers (
      id serial primary key,
      full_name text not null,
      phone text not null,
      category text not null default 'other',
      business_name text,
      notes text,
      created_at timestamp default now(),
      updated_at timestamp default now()
    )
  `);
}

export async function GET() {
  try {
    await ensureTable();
    const rows = await db.select().from(customers).orderBy(desc(customers.createdAt));
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const fullName = String(body?.fullName ?? "").trim();
    const phone = String(body?.phone ?? "").trim();
    const category = VALID_CATEGORIES.includes(body?.category) ? body.category : "other";
    const businessName = String(body?.businessName ?? "").trim();

    if (!fullName || !phone) {
      return NextResponse.json(
        { error: "fullName and phone are required" },
        { status: 400 }
      );
    }

    await ensureTable();
    const rows = await db
      .insert(customers)
      .values({
        fullName,
        phone,
        category,
        businessName: businessName || null,
        notes: body?.notes ? String(body.notes) : null,
      })
      .returning();

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      {
        error: "Failed to create customer",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
