import { Pool } from "pg";
import { drizzle as drizzleNodePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzleNeonHttp } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not configured");
}

const isNeon = databaseUrl.includes("neon.tech");

function createDb() {
  if (isNeon) {
    return drizzleNeonHttp(neon(databaseUrl as string));
  }

  const globalForDb = globalThis as typeof globalThis & {
    __arenaNextJsPostgresqlPool?: Pool;
  };

  const pool =
    globalForDb.__arenaNextJsPostgresqlPool ??
    new Pool({
      connectionString: databaseUrl,
      ssl:
        databaseUrl?.includes("sslmode=require") ||
        databaseUrl?.includes("supabase") ||
        databaseUrl?.includes("amazonaws.com")
          ? { rejectUnauthorized: false }
          : undefined,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsPostgresqlPool = pool;
  }

  return drizzleNodePg(pool);
}

export const db = createDb();
