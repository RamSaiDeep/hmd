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
    const eventRequests = await prisma.eventRequest.findMany({
      where: {
        userId: user.id
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ 
      eventRequests: eventRequests.map((request) => ({
        id: request.id,
        eventName: request.eventName,
        organizerName: request.organizerName,
        eventDate: request.eventDate,
        eventTime: request.eventTime,
        departments: request.departments,
        dhwaniItems: request.dhwaniItems,
        prakashVenue: request.prakashVenue,
        prakashLighting: request.prakashLighting,
        kritiNeeds: request.kritiNeeds,
        notes: request.notes,
        status: request.status,
        memberResponse: request.memberResponse,
        createdAt: request.createdAt.toISOString(),
      }))
    });
  } catch (error) {
    console.error("GET /api/user/event-requests error:", error);
    return NextResponse.json({ error: "Failed to fetch event requests" }, { status: 500 });
  }
}
