import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bankCards } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.delete(bankCards).where(eq(bankCards.id, parseInt(id))).returning();
    if (result.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting bank card:", error);
    return NextResponse.json({ error: "Failed to delete bank card" }, { status: 500 });
  }
}
