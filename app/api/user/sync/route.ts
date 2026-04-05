import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    console.info("[user/sync] Sync request started");
    const supabase = await createClient();
    console.info("[user/sync] Supabase server client created");

    // Get current logged in user
    const { data: { user }, error } = await supabase.auth.getUser();
    console.info("[user/sync] Supabase auth.getUser completed", {
      hasUser: Boolean(user),
      hasError: Boolean(error),
    });

    if (error || !user) {
      console.log("Sync error: No user logged in");
      return NextResponse.json(
        { error: "Not logged in" },
        { status: 401 }
      );
    }

    if (!user.email?.trim()) {
      return NextResponse.json(
        { error: "User email missing in Supabase profile" },
        { status: 400 }
      );
    }

    const normalizedEmail = user.email.trim().toLowerCase();
    console.log("Syncing user:", normalizedEmail);
    console.info("[user/sync] Checking for existing Prisma records", {
      userId: user.id,
      email: normalizedEmail,
    });

    const { name, phone, room, role } = user.user_metadata;

    const existingById = await prisma.user.findUnique({
      where: { id: user.id },
    });
    const existingByEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    console.info("[user/sync] Existing user lookup complete", {
      foundById: Boolean(existingById),
      foundByEmail: Boolean(existingByEmail),
    });

    if (existingById && existingByEmail && existingById.id !== existingByEmail.id) {
      console.info("[user/sync] Entering merge path: existingById and existingByEmail mismatch");
      await prisma.user.update({
        where: { id: existingByEmail.id },
        data: {
          name: name ?? existingByEmail.name,
          phone: phone ?? existingByEmail.phone,
          room: room ?? existingByEmail.room,
          role: role ?? existingByEmail.role,
          emailVerified: user.email_confirmed_at
            ? new Date(user.email_confirmed_at)
            : existingByEmail.emailVerified,
        },
      });
      console.log("User synced using email-linked record:", normalizedEmail);
    } else if (existingById) {
      console.info("[user/sync] Entering update-by-id path");
      await prisma.user.update({
        where: { id: user.id },
        data: {
          email: normalizedEmail,
          name: name ?? existingById.name,
          phone: phone ?? existingById.phone,
          room: room ?? existingById.room,
          role: role ?? existingById.role,
          emailVerified: user.email_confirmed_at
            ? new Date(user.email_confirmed_at)
            : existingById.emailVerified,
        },
      });
      console.log("User updated by id in database:", normalizedEmail);
    } else if (existingByEmail) {
      console.info("[user/sync] Entering update-by-email path");
      await prisma.user.update({
        where: { email: normalizedEmail },
        data: {
          name: name ?? existingByEmail.name,
          phone: phone ?? existingByEmail.phone,
          room: room ?? existingByEmail.room,
          role: role ?? existingByEmail.role,
          emailVerified: user.email_confirmed_at
            ? new Date(user.email_confirmed_at)
            : existingByEmail.emailVerified,
        },
      });
      console.log("User updated by email in database:", normalizedEmail);
    } else {
      console.info("[user/sync] Entering create-user path");
      await prisma.user.create({
        data: {
          id: user.id,
          email: normalizedEmail,
          name: name ?? null,
          phone: phone ?? null,
          room: room ?? null,
          role: role ?? "user",
          emailVerified: user.email_confirmed_at
            ? new Date(user.email_confirmed_at)
            : null,
        },
      });
      console.log("User created in database:", normalizedEmail);
    }
    console.info("[user/sync] Sync completed successfully", {
      userId: user.id,
      email: normalizedEmail,
    });

    return NextResponse.json({ message: "User synced successfully" });

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

    return NextResponse.json(
      { error: "Failed to sync user" },
      { status: 500 }
    );
  }
}
