import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { events } from "@/db/schema";
import { eq, desc, sql, gte, and, ne } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let result;
    if (status && status !== "all") {
      result = await db
        .select()
        .from(events)
        .where(eq(events.status, status))
        .orderBy(desc(events.gregorianDate));
    } else {
      result = await db
        .select()
        .from(events)
        .orderBy(desc(events.gregorianDate));
    }

    // Calculate dashboard stats
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const allEvents = await db.select().from(events);

    const totalEvents = allEvents.length;
    const unsettledEvents = allEvents.filter(
      (e) => e.status !== "settled" && e.status !== "cancelled"
    ).length;
    const totalRevenue = allEvents.reduce((sum, e) => sum + (e.fee || 0), 0);
    const upcomingEvents = allEvents.filter(
      (e) => e.gregorianDate >= todayStr && e.status !== "cancelled"
    );

    return NextResponse.json({
      events: result,
      stats: {
        totalEvents,
        unsettledEvents,
        totalRevenue,
        upcomingCount: upcomingEvents.length,
        upcomingEvents: upcomingEvents.slice(0, 5),
      },
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await db
      .insert(events)
      .values({
        eventType: body.eventType || "wedding",
        title: body.title || null,
        shamsiDate: body.shamsiDate,
        gregorianDate: body.gregorianDate,
        venue: body.venue || null,
        location: body.location || null,
        fee: body.fee || 0,
        deposit: body.deposit || 0,
        equipmentNeeded: body.equipmentNeeded || null,
        soundLightProvider: body.soundLightProvider || null,
        soundLightProviderPhone: body.soundLightProviderPhone || null,
        soundLightRequirements: body.soundLightRequirements || null,
        soundLightCost: body.soundLightCost || 0,
        description: body.description || null,
        customerName: body.customerName || null,
        customerPhone: body.customerPhone || null,
        guestCount: body.guestCount || 0,
        status: body.status || "pending",
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
