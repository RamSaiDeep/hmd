import { findAppUserForSupabaseUser, syncAppUserFromSupabaseUser } from "@/lib/app-user";
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
    const dbUser = await findAppUserForSupabaseUser(user);

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

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

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

    const dbUser = await syncAppUserFromSupabaseUser(user);

    const complaint = await prisma.complaint.create({
      data: {
        userId: dbUser.id,
        place,
        issueType,
        issueDetail: issueDetail.length ? issueDetail : null,
        description: description.length ? description : null,
      },
    });

    return NextResponse.json({ complaint }, { status: 201 });
  } catch (error) {
    console.error("POST /complaints error:", error);
    return NextResponse.json({ error: "Failed to submit complaint" }, { status: 500 });
  }
}
