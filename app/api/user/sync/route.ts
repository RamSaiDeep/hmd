import { NextResponse } from "next/server";

import { syncAppUserFromSupabaseUser } from "@/lib/app-user";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    console.info("[user/sync] Sync request started");
    const supabase = await createClient();
    console.info("[user/sync] Supabase server client created");

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    console.info("[user/sync] Supabase auth.getUser completed", {
      hasUser: Boolean(user),
      hasError: Boolean(error),
    });

    if (error || !user) {
      console.log("Sync error: No user logged in");
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    if (!user.email?.trim()) {
      return NextResponse.json(
        { error: "User email missing in Supabase profile" },
        { status: 400 }
      );
    }

    const normalizedEmail = user.email.trim().toLowerCase();
    console.log("Syncing user:", normalizedEmail);

    const dbUser = await syncAppUserFromSupabaseUser(user);
    console.info("[user/sync] Sync completed successfully", {
      userId: dbUser.id,
      email: normalizedEmail,
    });

    return NextResponse.json({ message: "User synced successfully", user: dbUser });
  } catch (error) {
    console.error("Sync error:", error);

    const message = error instanceof Error ? error.message : "Unknown error";
    const isPrismaConfigIssue = message.includes("Prisma Client v7 requires either PRISMA_ACCELERATE_URL");
    console.error("[user/sync] Sync failed", {
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
