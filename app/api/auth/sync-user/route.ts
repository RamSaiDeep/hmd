export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!user.email?.trim()) {
      return NextResponse.json({ error: "User email missing" }, { status: 400 });
    }

    const normalizedEmail = user.email.trim().toLowerCase();

    const dbUser = await prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: normalizedEmail,
        name: user.user_metadata?.name ?? null,
        phone: user.user_metadata?.phone ?? null,
        room: user.user_metadata?.room ?? null,
        role: user.user_metadata?.role ?? "user",
        emailVerified: user.email_confirmed_at ? new Date(user.email_confirmed_at) : null,
      },
      create: {
        id: user.id, // 🔥 SAME as Supabase ID
        email: normalizedEmail,
        name: user.user_metadata?.name || null,
        phone: user.user_metadata?.phone || null,
        room: user.user_metadata?.room || null,
        role: user.user_metadata?.role || "user",
        emailVerified: user.email_confirmed_at ? new Date(user.email_confirmed_at) : null,
      },
    });

    return NextResponse.json({ user: dbUser });

  } catch (error) {
    console.error("Sync user error:", error);

    return NextResponse.json(
      { error: "Failed to sync user" },
      { status: 500 }
    );
  }
}
