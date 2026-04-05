import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  console.log("Auth callback — code received:", !!code);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      console.log("Auth callback — session created, syncing user to database");

      // Ensure Prisma User row exists right after email verification/OAuth callback.
      await fetch(`${origin}/api/auth/sync-user`, {
        method: "POST",
        headers: { Cookie: request.headers.get("cookie") ?? "" },
      });

      return NextResponse.redirect(`${origin}${next}`);
    }

    console.log("Auth callback — error:", error.message);
  }

  return NextResponse.redirect(`${origin}/login?error=Could not verify email`);
}
