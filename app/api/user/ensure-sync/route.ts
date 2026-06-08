import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { syncAuthUserToPrisma } from "@/lib/sync-user";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const existingUser = await prisma.user.findUnique({ where: { id: user.id } });
    const syncedUser = await syncAuthUserToPrisma(user);
    const isNewUser = !existingUser;

    return NextResponse.json({
      message: isNewUser ? "User created successfully" : "User updated successfully",
      user: syncedUser,
      isNewUser,
    });
  } catch (error) {
    console.error("User ensure-sync error:", error);
    return NextResponse.json(
      {
        error: "Failed to sync user: " + (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}
