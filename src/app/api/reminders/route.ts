import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reminders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const result = await db.select().from(reminders).orderBy(desc(reminders.gregorianDate));
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching reminders:", error);
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await db.insert(reminders).values({
      title: body.title,
      shamsiDate: body.shamsiDate,
      gregorianDate: body.gregorianDate,
      time: body.time || null,
      notifyBefore: body.notifyBefore || "0",
      contactName: body.contactName || null,
      contactPhone: body.contactPhone || null,
      description: body.description || null,
    }).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating reminder:", error);
    return NextResponse.json({ error: "Failed to create reminder" }, { status: 500 });
  }
}
