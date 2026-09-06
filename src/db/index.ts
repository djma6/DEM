import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/app_db";

const needsSsl =
  databaseUrl.includes("neon.tech") ||
  databaseUrl.includes("supabase") ||
  databaseUrl.includes("sslmode=require") ||
  databaseUrl.includes("amazonaws.com");

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 8000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
