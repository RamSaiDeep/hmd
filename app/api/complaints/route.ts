import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error } = await supabase.auth.getUser();

    if (!user || error) {
      return NextResponse.json({ complaints: [] }, { status: 401 });
    }

    // 🔥 Get user from DB
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    });

    if (!dbUser) {
      return NextResponse.json({ complaints: [] });
    }

    // 🔥 Fetch ONLY this user's complaints
    const complaints = await prisma.complaint.findMany({
      where: {
        userId: dbUser.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ complaints });

  } catch (error) {
    console.error("GET /complaints error:", error);
    return NextResponse.json({ complaints: [] }, { status: 500 });
  }
}