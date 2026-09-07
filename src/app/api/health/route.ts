import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return Response.json({
      ok: true,
      hasEnvDatabaseUrl: Boolean(process.env.DATABASE_URL),
      dbHost: process.env.DATABASE_URL ? (new URL(process.env.DATABASE_URL.replace(/^postgresql:\/\//, "http://")).hostname) : "default-localhost",
    });
  } catch (err) {
    return Response.json({
      ok: false,
      hasEnvDatabaseUrl: Boolean(process.env.DATABASE_URL),
      error: err instanceof Error ? err.message : String(err),
    }, { status: 500 });
  }
}
