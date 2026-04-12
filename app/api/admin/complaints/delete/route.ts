export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const prisma = getPrismaClient();
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
    if (!dbUser || dbUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = (await request.json()) as { id?: string };

    if (!id) {
      return NextResponse.json({ error: "Complaint id is required" }, { status: 400 });
    }

    await prisma.complaint.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/admin/complaints/delete error:", error);
    return NextResponse.json({ error: "Failed to delete complaint" }, { status: 500 });
  }
}
