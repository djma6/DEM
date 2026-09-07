import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq } from "drizzle-orm";

const VALID_CATEGORIES = ["ceremony", "restaurant", "club", "dj", "other"];

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
      .update(customers)
      .set({
        fullName,
        phone,
        category: VALID_CATEGORIES.includes(body?.category) ? body.category : "other",
        businessName: body?.businessName ? String(body.businessName).trim() : null,
        notes: body?.notes ? String(body.notes) : null,
        updatedAt: new Date(),
      })
      .where(eq(customers.id, parseInt(id)))
      .returning();

    if (rows.length === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rows = await db
      .delete(customers)
      .where(eq(customers.id, parseInt(id)))
      .returning();

    if (rows.length === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
  }
}
