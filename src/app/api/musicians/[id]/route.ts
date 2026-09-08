import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { musicians } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const rows = await db
      .update(musicians)
      .set({
        fullName,
        instrument,
        phone,
        fee: Number(body?.fee) || 0,
        notes: body?.notes ? String(body.notes) : null,
        updatedAt: new Date(),
      })
      .where(eq(musicians.id, parseInt(id)))
      .returning();

    if (rows.length === 0) {
      return NextResponse.json({ error: "Musician not found" }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error updating musician:", error);
    return NextResponse.json({ error: "Failed to update musician" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rows = await db
      .delete(musicians)
      .where(eq(musicians.id, parseInt(id)))
      .returning();

    if (rows.length === 0) {
      return NextResponse.json({ error: "Musician not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting musician:", error);
    return NextResponse.json({ error: "Failed to delete musician" }, { status: 500 });
  }
}
