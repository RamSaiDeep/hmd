import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncAuthUserToPrisma } from "@/lib/sync-user";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await syncAuthUserToPrisma(user);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }

    console.log("Auth callback error:", error.message);
  }

  return NextResponse.redirect(`${origin}/login?error=Could not verify email`);
}
