import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { soundProviders } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const name = String(body?.name ?? "").trim();
    const phone = String(body?.phone ?? "").trim();

    if (!name || !phone) {
      return NextResponse.json(
        { error: "name and phone are required" },
        { status: 400 }
      );
    }

    const rows = await db
      .update(soundProviders)
      .set({
        name,
        phone,
        cost: Number(body?.cost) || 0,
        equipment: body?.equipment ? String(body.equipment) : null,
        notes: body?.notes ? String(body.notes) : null,
        updatedAt: new Date(),
      })
      .where(eq(soundProviders.id, parseInt(id)))
      .returning();

    if (rows.length === 0) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error updating sound provider:", error);
    return NextResponse.json({ error: "Failed to update provider" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rows = await db
      .delete(soundProviders)
      .where(eq(soundProviders.id, parseInt(id)))
      .returning();

    if (rows.length === 0) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting sound provider:", error);
    return NextResponse.json({ error: "Failed to delete provider" }, { status: 500 });
  }
}
