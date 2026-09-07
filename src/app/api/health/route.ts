import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

function configuredHost() {
  const value = process.env.DATABASE_URL?.trim();
  if (!value) return "missing";
  try {
    return new URL(value.replace(/^postgresql:\/\//, "http://")).hostname;
  } catch {
    return "invalid-url";
  }
}

export async function GET() {
  const dbHost = configuredHost();
  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, dbHost });
  } catch (err: unknown) {
    const e = err as Record<string, unknown>;
    const cause = e?.cause as Record<string, unknown> | undefined;
    return Response.json(
      {
        ok: false,
        dbHost,
        error: err instanceof Error ? err.message : String(err),
        causeMessage: cause?.message || null,
        causeCode: cause?.code || null,
      },
      { status: 500 }
    );
  }
}
