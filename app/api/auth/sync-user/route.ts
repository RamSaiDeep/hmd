export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { syncAppUserFromSupabaseUser } from "@/lib/app-user";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    console.info("[auth/sync-user] Sync request started");
    const supabase = await createClient();
    console.info("[auth/sync-user] Supabase server client created");

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    console.info("[auth/sync-user] Supabase auth.getUser completed", {
      hasUser: Boolean(user),
      hasError: Boolean(error),
    });

    if (error || !user) {
      console.warn("[auth/sync-user] Not authenticated", { error });
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!user.email?.trim()) {
      console.warn("[auth/sync-user] User email missing");
      return NextResponse.json({ error: "User email missing" }, { status: 400 });
    }

    console.info("[auth/sync-user] Upserting user into Prisma", {
      userId: user.id,
      email: user.email.trim().toLowerCase(),
    });

    const dbUser = await syncAppUserFromSupabaseUser(user);
    console.info("[auth/sync-user] Prisma upsert successful", { userId: dbUser.id });

    return NextResponse.json({ user: dbUser });
  } catch (error) {
    console.error("Sync user error:", error);

    const message = error instanceof Error ? error.message : "Unknown error";
    const isPrismaConfigIssue = message.includes("Prisma Client v7 requires either PRISMA_ACCELERATE_URL");
    console.error("[auth/sync-user] Sync failed", {
      message,
      isPrismaConfigIssue,
    });

    if (isPrismaConfigIssue) {
      return NextResponse.json(
        {
          error:
            "Database sync is not configured. Set PRISMA_ACCELERATE_URL, or install and configure @prisma/adapter-pg.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}
