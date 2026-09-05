import { NextResponse } from "next/server";
import { db } from "@/db";
import { events, reminders, bankCards } from "@/db/schema";

export async function DELETE() {
  try {
    await db.delete(reminders);
    await db.delete(bankCards);
    await db.delete(events);
    return NextResponse.json({ success: true, message: "All data has been deleted" });
  } catch (error) {
    console.error("Error resetting app:", error);
    return NextResponse.json({ error: "Failed to reset app" }, { status: 500 });
  }
}
