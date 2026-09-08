import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { colleagues } from "@/db/schema";
import { eq } from "drizzle-orm";

const VALID_ROLES = ["dj", "showman", "singer", "vipMusic"];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const fullName = String(body?.fullName ?? "").trim();
    const phone = String(body?.phone ?? "").trim();

    if (!fullName || !phone) {
      return NextResponse.json(
        { error: "fullName and phone are required" },
        { status: 400 }
      );
    }

    const rows = await db
      .update(colleagues)
      .set({
        fullName,
        role: VALID_ROLES.includes(body?.role) ? body.role : "dj",
        phone,
        fee: Number(body?.fee) || 0,
        notes: body?.notes ? String(body.notes) : null,
        updatedAt: new Date(),
      })
      .where(eq(colleagues.id, parseInt(id)))
      .returning();

    if (rows.length === 0) {
      return NextResponse.json({ error: "Colleague not found" }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error updating colleague:", error);
    return NextResponse.json({ error: "Failed to update colleague" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rows = await db
      .delete(colleagues)
      .where(eq(colleagues.id, parseInt(id)))
      .returning();

    if (rows.length === 0) {
      return NextResponse.json({ error: "Colleague not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting colleague:", error);
    return NextResponse.json({ error: "Failed to delete colleague" }, { status: 500 });
  }
}
