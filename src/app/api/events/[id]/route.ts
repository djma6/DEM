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

    const result = await db
      .update(events)
      .set({
        eventType: body.eventType,
        title: body.title,
        shamsiDate: body.shamsiDate,
        gregorianDate: body.gregorianDate,
        venue: body.venue,
        location: body.location,
        fee: body.fee,
        deposit: body.deposit,
        equipmentNeeded: body.equipmentNeeded,
        soundLightProvider: body.soundLightProvider,
        soundLightProviderPhone: body.soundLightProviderPhone,
        soundLightRequirements: body.soundLightRequirements,
        soundLightCost: body.soundLightCost,
        description: body.description,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        guestCount: body.guestCount,
        status: body.status,
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
