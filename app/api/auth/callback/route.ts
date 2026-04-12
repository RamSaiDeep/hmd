import { NextResponse } from "next/server";

import { syncAppUserFromSupabaseUser } from "@/lib/app-user";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function getSafeRedirectPath(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }

  return next;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextPath = getSafeRedirectPath(searchParams.get("next"));

  console.log("Auth callback - code received:", !!code);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      console.log("Auth callback - session created, syncing user to database");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email?.trim()) {
        await syncAppUserFromSupabaseUser(user);
      }

      return NextResponse.redirect(new URL(nextPath, origin));
    }

    console.log("Auth callback - error:", error.message);
  }

  return NextResponse.redirect(new URL("/login?error=Could not verify email", origin));
}
