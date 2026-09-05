import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bankCards } from "@/db/schema";

export async function GET() {
  try {
    const result = await db.select().from(bankCards);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching bank cards:", error);
    return NextResponse.json({ error: "Failed to fetch bank cards" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await db.insert(bankCards).values({
      title: body.title,
      cardNumber: body.cardNumber,
    }).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating bank card:", error);
    return NextResponse.json({ error: "Failed to create bank card" }, { status: 500 });
  }
}
