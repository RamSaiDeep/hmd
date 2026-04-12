export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { findAppUserForSupabaseUser } from "@/lib/app-user";
import { createClient } from "@/lib/supabase/server";
import { resolveAppRole } from "@/lib/user-role";

export const revalidate = 0;

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await findAppUserForSupabaseUser(user);

    return NextResponse.json({
      id: dbUser?.id ?? user.id,
      role: resolveAppRole(dbUser?.role, user),
    }, {
      headers: {
        "Cache-Control": "private, no-store, no-cache, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    console.error("GET /api/user/me error:", error);
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
  }
}
