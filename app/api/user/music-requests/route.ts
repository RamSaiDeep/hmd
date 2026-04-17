import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get music requests for the current user using userId
    const musicRequests = await prisma.musicRequest.findMany({
      where: {
        userId: user.id
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ 
      musicRequests: musicRequests.map((request) => ({
        id: request.id,
        eventName: request.eventName,
        organizer: request.organizer,
        eventDate: request.eventDate,
        eventTime: request.eventTime,
        venue: request.venue,
        soundItems: request.soundItems,
        needsLight: request.needsLight,
        lighting: request.lighting,
        notes: request.notes,
        status: request.status,
        adminResponse: request.adminResponse,
        alternativeDate: request.alternativeDate,
        alternativeTime: request.alternativeTime,
        alternativeVenue: request.alternativeVenue,
        alternativeSoundItems: request.alternativeSoundItems,
        alternativeLighting: request.alternativeLighting,
        alternativeNotes: request.alternativeNotes,
        createdAt: request.createdAt.toISOString(),
      }))
    });
  } catch (error) {
    console.error("GET /api/user/music-requests error:", error);
    return NextResponse.json({ error: "Failed to fetch music requests" }, { status: 500 });
  }
}
