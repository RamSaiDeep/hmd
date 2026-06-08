import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { canAccessAdminPanel, canAccessSuperuserPanel } from "@/lib/roles";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (!user || userError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    if (!dbUser || (!canAccessAdminPanel(dbUser.role) && !canAccessSuperuserPanel(dbUser.role))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, type, memberId } = await request.json();

    if (!id || !type || !memberId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (type === "complaint") {
      await prisma.complaintAcceptance.create({
        data: { complaintId: id, memberId },
      });
    } else if (type === "event") {
      await prisma.eventAcceptance.create({
        data: { eventId: id, memberId },
      });
    } else if (type === "music") {
      await prisma.musicAcceptance.create({
        data: { musicId: id, memberId },
      });
    } else if (type === "studio") {
      await prisma.studioAcceptance.create({
        data: { bookingId: id, memberId },
      });
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in assign route:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Member is already assigned to this request" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
