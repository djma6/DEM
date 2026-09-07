import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { userProfiles } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

interface GoogleIdentity {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
}

async function getGoogleIdentity(request: NextRequest): Promise<GoogleIdentity | null> {
  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token) return null;

  try {
    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const identity = (await response.json()) as GoogleIdentity;
    if (!identity.sub || !identity.email) return null;
    return identity;
  } catch {
    return null;
  }
}

async function ensureProfileTable() {
  await db.execute(sql`
    create table if not exists user_profiles (
      google_sub text primary key,
      email text not null,
      name text not null,
      phone text not null,
      instagram text,
      picture text,
      created_at timestamp default now(),
      updated_at timestamp default now()
    )
  `);
}

export async function GET(request: NextRequest) {
  const identity = await getGoogleIdentity(request);
  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureProfileTable();
    const rows = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.googleSub, identity.sub))
      .limit(1);

    return NextResponse.json({ profile: rows[0] ?? null });
  } catch (error) {
    console.error("Profile read failed:", error);
    return NextResponse.json({ error: "Failed to read profile" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const identity = await getGoogleIdentity(request);
  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = String(body?.name ?? "").trim();
    const phone = String(body?.phone ?? "").trim();
    const instagram = String(body?.instagram ?? "").trim();

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone are required" },
        { status: 400 }
      );
    }

    await ensureProfileTable();
    const values = {
      googleSub: identity.sub,
      email: identity.email.toLowerCase(),
      name,
      phone,
      instagram: instagram || null,
      picture: identity.picture || null,
      updatedAt: new Date(),
    };

    const rows = await db
      .insert(userProfiles)
      .values(values)
      .onConflictDoUpdate({
        target: userProfiles.googleSub,
        set: {
          email: values.email,
          name: values.name,
          phone: values.phone,
          instagram: values.instagram,
          picture: values.picture,
          updatedAt: values.updatedAt,
        },
      })
      .returning();

    return NextResponse.json({ profile: rows[0] });
  } catch (error) {
    console.error("Profile save failed:", error);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
