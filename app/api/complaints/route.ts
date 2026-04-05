
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// 🔥 Helper: Get or create Prisma user from Supabase user
async function getOrCreateUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const dbUser = await prisma.user.upsert({
    where: { email: user.email! },
    update: {},
    create: {
      id: user.id, // ✅ same ID as Supabase
      email: user.email!,
      name: user.user_metadata?.name || null,
      phone: user.user_metadata?.phone || null,
      room: user.user_metadata?.room || null,
      role: "user",
    },
  });

  return dbUser;
}

// ===================== GET =====================
export async function GET() {
  try {
    const dbUser = await getOrCreateUser();

    if (!dbUser) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const complaints = await prisma.complaint.findMany({
      where: { userId: dbUser.id }, // ✅ FIXED
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ complaints });

  } catch (error) {
    console.error("GET /complaints error:", error);

    return NextResponse.json(
      { error: "Failed to fetch complaints" },
      { status: 500 }
    );
  }
}

// ===================== POST =====================
export async function POST(req: Request) {
  try {
    const dbUser = await getOrCreateUser();

    if (!dbUser) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const body = await req.json().catch(() => null) as null | {
      place?: string;
      issueType?: string;
      issueDetail?: string;
      description?: string;
    };

    if (!body?.place?.trim() || !body?.issueType?.trim()) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const complaint = await prisma.complaint.create({
      data: {
        userId: dbUser.id, // ✅ FIXED
        place: body.place.trim(),
        issueType: body.issueType.trim(),
        issueDetail: body.issueDetail?.trim() || null,
        description: body.description?.trim() || null,
      },
    });

    return NextResponse.json({ complaint }, { status: 201 });

  } catch (error) {
    console.error("POST /complaints error:", error);

    return NextResponse.json(
      { error: "Failed to create complaint" },
      { status: 500 }
    );
  }
}