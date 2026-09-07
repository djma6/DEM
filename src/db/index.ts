import { Pool } from "pg";
import { drizzle as drizzleNodePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzleNeonHttp } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const NEON_DEFAULT_URL =
  "postgresql://neondb_owner:npg_o5OAxwT3RMhW@ep-holy-mountain-ax2p2myz-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require";

const envUrl = process.env.DATABASE_URL?.trim();

// Use process.env.DATABASE_URL if valid and not localhost, otherwise use Neon
const databaseUrl =
  envUrl && !envUrl.includes("127.0.0.1") && !envUrl.includes("localhost")
    ? envUrl
    : NEON_DEFAULT_URL;

const isNeon = databaseUrl.includes("neon.tech");

function createDb() {
  if (isNeon) {
    const client = neon(databaseUrl);
    return drizzleNeonHttp(client);
  }

  const globalForDb = globalThis as typeof globalThis & {
    __arenaNextJsPostgresqlPool?: Pool;
  };

  const pool =
    globalForDb.__arenaNextJsPostgresqlPool ??
    new Pool({
      connectionString: databaseUrl,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsPostgresqlPool = pool;
  }

  return drizzleNodePg(pool);
}

export const db = createDb();
