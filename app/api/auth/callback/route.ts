import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

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

      if (user?.email?.trim()) {
        const normalizedEmail = user.email.trim().toLowerCase();

        await prisma.user.upsert({
          where: { id: user.id },
          update: {
            email: normalizedEmail,
            name: user.user_metadata?.name ?? null,
            phone: user.user_metadata?.phone ?? null,
            room: user.user_metadata?.room ?? null,
            role: user.user_metadata?.role ?? "user",
            emailVerified: user.email_confirmed_at
              ? new Date(user.email_confirmed_at)
              : null,
          },
          create: {
            id: user.id,
            email: normalizedEmail,
            name: user.user_metadata?.name ?? null,
            phone: user.user_metadata?.phone ?? null,
            room: user.user_metadata?.room ?? null,
            role: user.user_metadata?.role ?? "user",
            emailVerified: user.email_confirmed_at
              ? new Date(user.email_confirmed_at)
              : null,
          },
        });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }

    console.log("Auth callback error:", error.message);
  }

  return NextResponse.redirect(`${origin}/login?error=Could not verify email`);
}
