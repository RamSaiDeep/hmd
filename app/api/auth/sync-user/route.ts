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

    const dbUser = await prisma.user.upsert({
      where: { email: user.email! },
      update: {},
      create: {
        id: user.id, // 🔥 SAME as Supabase ID
        email: user.email!,
        name: user.user_metadata?.name || null,
        phone: user.user_metadata?.phone || null,
        room: user.user_metadata?.room || null,
        role: "user",
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

