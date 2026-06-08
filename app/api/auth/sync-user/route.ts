export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncAuthUserToPrisma } from "@/lib/sync-user";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const dbUser = await syncAuthUserToPrisma(user);

    return NextResponse.json({ user: dbUser });
  } catch (error) {
    console.error("Sync user error:", error);

    const message = error instanceof Error ? error.message : "Unknown error";
    const isPrismaConfigIssue = message.includes("Prisma Client v7 requires either PRISMA_ACCELERATE_URL");

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
