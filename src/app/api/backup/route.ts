import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { events, reminders, bankCards } from "@/db/schema";

export async function GET() {
  try {
    const [allEvents, allReminders, allCards] = await Promise.all([
      db.select().from(events),
      db.select().from(reminders),
      db.select().from(bankCards),
    ]);

    return NextResponse.json({
      version: "2.0",
      exportDate: new Date().toISOString(),
      events: allEvents,
      reminders: allReminders,
      bankCards: allCards,
    });
  } catch (error) {
    console.error("Error creating backup:", error);
    return NextResponse.json({ error: "Failed to create backup" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body || !Array.isArray(body.events)) {
      return NextResponse.json({ error: "Invalid backup format" }, { status: 400 });
    }

    // Clear existing data
    await db.delete(reminders);
    await db.delete(bankCards);
    await db.delete(events);

    // Restore events
    for (const e of body.events) {
      await db.insert(events).values({
        eventType: e.eventType ?? "wedding",
        title: e.title ?? null,
        shamsiDate: e.shamsiDate,
        gregorianDate: e.gregorianDate,
        venue: e.venue ?? null,
        location: e.location ?? null,
        fee: e.fee ?? 0,
        deposit: e.deposit ?? 0,
        equipmentNeeded: e.equipmentNeeded ?? null,
        soundLightProvider: e.soundLightProvider ?? null,
        soundLightProviderPhone: e.soundLightProviderPhone ?? null,
        soundLightRequirements: e.soundLightRequirements ?? null,
        soundLightCost: e.soundLightCost ?? 0,
        description: e.description ?? null,
        customerName: e.customerName ?? null,
        customerPhone: e.customerPhone ?? null,
        guestCount: e.guestCount ?? 0,
        status: e.status ?? "pending",
      });
    }

    // Restore reminders
    if (Array.isArray(body.reminders)) {
      for (const r of body.reminders) {
        await db.insert(reminders).values({
          title: r.title,
          shamsiDate: r.shamsiDate,
          gregorianDate: r.gregorianDate,
          time: r.time ?? null,
          notifyBefore: r.notifyBefore ?? "0",
          contactName: r.contactName ?? null,
          contactPhone: r.contactPhone ?? null,
          description: r.description ?? null,
          completed: r.completed ?? 0,
        });
      }
    }

    // Restore bank cards
    if (Array.isArray(body.bankCards)) {
      for (const c of body.bankCards) {
        await db.insert(bankCards).values({
          title: c.title,
          cardNumber: c.cardNumber,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${body.events.length} events`,
    });
  } catch (error) {
    console.error("Error restoring backup:", error);
    return NextResponse.json({ error: "Failed to restore backup" }, { status: 500 });
  }
}
