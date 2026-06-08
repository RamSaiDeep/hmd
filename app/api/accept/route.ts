import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (!user || userError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, type } = await request.json();

    if (!id || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify user is a member/admin/superuser
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    if (!dbUser || dbUser.role === "user") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get current limits
    const settingsItems = await prisma.systemSetting.findMany();
    const settings = settingsItems.reduce((acc: Record<string, string>, s: { key: string; value: string }) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);

    if (type === "complaint") {
      const limit = parseInt(settings.COMPLAINT_ACCEPTANCE_LIMIT || "2", 10);
      const count = await prisma.complaintAcceptance.count({ where: { complaintId: id } });
      
      if (count >= limit) {
        return NextResponse.json({ error: "Acceptance limit reached" }, { status: 400 });
      }

      await prisma.complaintAcceptance.create({
        data: { complaintId: id, memberId: user.id },
      });
    } else if (type === "event") {
      const limit = parseInt(settings.EVENT_ACCEPTANCE_LIMIT || "5", 10);
      const count = await prisma.eventAcceptance.count({ where: { eventId: id } });
      
      if (count >= limit) {
        return NextResponse.json({ error: "Acceptance limit reached" }, { status: 400 });
      }

      await prisma.eventAcceptance.create({
        data: { eventId: id, memberId: user.id },
      });
    } else if (type === "music") {
      const limit = parseInt(settings.MUSIC_ACCEPTANCE_LIMIT || "5", 10);
      const count = await prisma.musicAcceptance.count({ where: { musicId: id } });
      
      if (count >= limit) {
        return NextResponse.json({ error: "Acceptance limit reached" }, { status: 400 });
      }

      await prisma.musicAcceptance.create({
        data: { musicId: id, memberId: user.id },
      });
    } else if (type === "studio") {
      const limit = parseInt(settings.STUDIO_ACCEPTANCE_LIMIT || "2", 10);
      const count = await prisma.studioAcceptance.count({ where: { bookingId: id } });
      
      if (count >= limit) {
        return NextResponse.json({ error: "Acceptance limit reached" }, { status: 400 });
      }

      await prisma.studioAcceptance.create({
        data: { bookingId: id, memberId: user.id },
      });
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in accept route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
