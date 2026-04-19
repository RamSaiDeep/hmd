export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    console.info("[auth/sync-user] Sync request started");
    const supabase = await createClient();
    console.info("[auth/sync-user] Supabase server client created");
    const { data: { user }, error } = await supabase.auth.getUser();
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

    const normalizedEmail = user.email.trim().toLowerCase();
    console.info("[auth/sync-user] Upserting user into Prisma", {
      userId: user.id,
      email: normalizedEmail,
    });

    const dbUser = await prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: normalizedEmail,
        name: user.user_metadata?.name ?? null,
        phone: user.user_metadata?.phone ?? null,
        room: user.user_metadata?.room ?? null,
        emailVerified: user.email_confirmed_at ? new Date(user.email_confirmed_at) : null,
      },
      create: {
        id: user.id, // 🔥 SAME as Supabase ID
        email: normalizedEmail,
        name: user.user_metadata?.name || null,
        phone: user.user_metadata?.phone || null,
        room: user.user_metadata?.room || null,
        role: user.user_metadata?.role || "user",
        emailVerified: user.email_confirmed_at ? new Date(user.email_confirmed_at) : null,
      },
    });
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

    return NextResponse.json(
      { error: "Failed to sync user" },
      { status: 500 }
    );
  }
}
