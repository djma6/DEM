import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { events } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body || !body.shamsiDate || !body.gregorianDate) {
      return NextResponse.json(
        { error: "shamsiDate and gregorianDate are required" },
        { status: 400 }
      );
    }

    const result = await db
      .update(events)
      .set({
        eventType: body.eventType || "wedding",
        title: body.title || null,
        shamsiDate: String(body.shamsiDate),
        gregorianDate: String(body.gregorianDate),
        venue: body.venue || null,
        location: body.location || null,
        fee: Number(body.fee) || 0,
        deposit: Number(body.deposit) || 0,
        equipmentNeeded: body.equipmentNeeded || null,
        soundLightProvider: body.soundLightProvider || null,
        soundLightProviderPhone: body.soundLightProviderPhone || null,
        soundLightRequirements: body.soundLightRequirements || null,
        soundLightCost: Number(body.soundLightCost) || 0,
        description: body.description || null,
        customerName: body.customerName || null,
        customerPhone: body.customerPhone || null,
        guestCount: Number(body.guestCount) || 0,
        status: body.status || "pending",
        updatedAt: new Date(),
      })
      .where(eq(events.id, parseInt(id)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await db
      .delete(events)
      .where(eq(events.id, parseInt(id)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
