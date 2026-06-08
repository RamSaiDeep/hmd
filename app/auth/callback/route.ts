import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncAuthUserToPrisma } from "@/lib/sync-user";

export const runtime = "nodejs";

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

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await syncAuthUserToPrisma(user);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }

    console.log("Auth callback — error:", error.message);
    // If the token was exchanged already (e.g. by an email scanner tool verifying links),
    // it will return an error here, but the user *is* actually verified.
    // Instead of showing a scary error, prompt them to just login.
    return NextResponse.redirect(`${origin}/login?verified=true`);
  }

  // If there's no code in the URL at all
  return NextResponse.redirect(`${origin}/login?error=Invalid verification link`);
}
