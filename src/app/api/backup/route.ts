import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { events } from "@/db/schema";

export async function GET() {
  try {
    const allEvents = await db.select().from(events);
    
    const backup = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      events: allEvents,
    };

    return NextResponse.json(backup);
  } catch (error) {
    console.error("Error creating backup:", error);
    return NextResponse.json(
      { error: "Failed to create backup" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.events || !Array.isArray(body.events)) {
      return NextResponse.json(
        { error: "Invalid backup format" },
        { status: 400 }
      );
    }

    // Clear existing events
    await db.delete(events);

    // Import events
    for (const event of body.events) {
      await db.insert(events).values({
        eventType: event.eventType,
        title: event.title,
        shamsiDate: event.shamsiDate,
        gregorianDate: event.gregorianDate,
        venue: event.venue,
        location: event.location,
        fee: event.fee,
        deposit: event.deposit,
        equipmentNeeded: event.equipmentNeeded,
        soundLightProvider: event.soundLightProvider,
        soundLightRequirements: event.soundLightRequirements,
        soundLightCost: event.soundLightCost,
        description: event.description,
        customerName: event.customerName,
        customerPhone: event.customerPhone,
        guestCount: event.guestCount,
        status: event.status,
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Imported ${body.events.length} events` 
    });
  } catch (error) {
    console.error("Error restoring backup:", error);
    return NextResponse.json(
      { error: "Failed to restore backup" },
      { status: 500 }
    );
  }
}
