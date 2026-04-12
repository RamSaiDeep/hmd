import { NextResponse } from "next/server";

import { syncAppUserFromSupabaseUser } from "@/lib/app-user";
import { createClient } from "@/lib/supabase/server";

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

    console.log("User Sync - Syncing user:", user.email);

    const syncedUser = await syncAppUserFromSupabaseUser(user);

    console.log("User Sync - User synced successfully:", syncedUser.email);
    return NextResponse.json({
      message: "User synced successfully",
      user: syncedUser,
      isNewUser: syncedUser.id === user.id,
    });
  } catch (error) {
    console.error("User Sync - Error:", error);
    return NextResponse.json(
      {
        error: "Failed to sync user: " + (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}
