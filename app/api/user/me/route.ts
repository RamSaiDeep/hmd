import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { resolveAppRole } from "@/lib/user-role";

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

    const dbUser =
      (await prisma.user.findUnique({ where: { id: user.id } })) ??
      (user.email ? await prisma.user.findUnique({ where: { email: user.email } }) : null);

    return NextResponse.json({
      id: user.id,
      role: resolveAppRole(dbUser?.role, user),
    });
  } catch (error) {
    console.error("GET /api/user/me error:", error);
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
  }
}
