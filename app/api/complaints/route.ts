import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { requireAuth, createSecureResponse } from "@/lib/auth-middleware";

export const GET = requireAuth(async (user) => {
  try {
    const supabase = await createClient();

    // 🔥 Get user from DB
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    });

    if (!dbUser) {
      return createSecureResponse({ complaints: [] });
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

    return createSecureResponse({ complaints });

  } catch (error) {
    console.error("GET /complaints error:", error);
    return createSecureResponse({ complaints: [] }, 500);
  }
});

export const POST = requireAuth(async (user, req: Request) => {
  try {
    const supabase = await createClient();

    if (!user.email?.trim()) {
      return NextResponse.json({ error: "User email missing" }, { status: 400 });
    }

    const body = (await req.json().catch(() => null)) as
      | {
          place?: string;
          issueType?: string;
          issueDetail?: string;
          description?: string;
        }
      | null;

    const place = body?.place?.trim() ?? "";
    const issueType = body?.issueType?.trim() ?? "";
    const issueDetail = (body?.issueDetail ?? "").trim();
    const description = (body?.description ?? "").trim();

    if (!place || !issueType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const normalizedEmail = user.email.trim().toLowerCase();

    // Optimized: Check if user exists, only create if needed
    let dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true }
    });

    if (!dbUser) {
      // Create user only if doesn't exist
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: normalizedEmail,
          name: user.user_metadata?.name ?? null,
          phone: user.user_metadata?.phone ?? null,
          room: user.user_metadata?.room ?? null,
          role: user.user_metadata?.role ?? "user",
          emailVerified: user.email_confirmed_at ? new Date(user.email_confirmed_at) : null,
        },
        select: { id: true }
      });
    }

    const complaint = await prisma.complaint.create({
      data: {
        userId: dbUser.id,
        place,
        issueType,
        issueDetail: issueDetail.length ? issueDetail : null,
        description: description.length ? description : null,
      },
    });

    return createSecureResponse({ complaint }, 201);
  } catch (error) {
    console.error("POST /complaints error:", error);
    return createSecureResponse({ error: "Failed to submit complaint" }, 500);
  }
});