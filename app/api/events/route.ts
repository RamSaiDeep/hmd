export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Prisma } from "@prisma/client";

type EventRequestBody = {
  eventName?: string;
  organizerName?: string;
  eventDate?: string;
  eventTime?: string;
  venue?: string;
  departments?: string[];
  dhwaniItems?: unknown;
  prakashVenue?: string;
  prakashLighting?: string[];
  kritiNeeds?: string;
  notes?: string;
};

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as EventRequestBody | null;

  if (!body?.eventName?.trim() || !body?.organizerName?.trim() || !body?.eventDate?.trim() || !body?.venue?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    // Ensure user exists in database using the sync API
    console.log("Events API - Ensuring user sync for:", user.email);
    
    const syncResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/user/ensure-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!syncResponse.ok) {
      const syncError = await syncResponse.json().catch(() => ({}));
      console.error("Events API - User sync failed:", syncError);
      return NextResponse.json({ 
        error: "User sync failed: " + (syncError.error || "Unknown sync error") 
      }, { status: 500 });
    }

    const syncResult = await syncResponse.json();
    console.log("Events API - User sync successful:", syncResult.message);

    const dhwaniItems =
      Array.isArray(body.dhwaniItems) && body.dhwaniItems.length > 0
        ? (body.dhwaniItems as Prisma.InputJsonValue)
        : undefined;

    const eventRequest = await prisma.eventRequest.create({
      data: {
        eventName: body.eventName.trim(),
        organizerName: body.organizerName.trim(),
        eventDate: body.eventDate.trim(),
        eventTime: body.eventTime?.trim() || null,
        departments: body.departments || [],
        dhwaniItems,
        prakashVenue: body.prakashVenue?.trim() || null,
        prakashLighting: body.prakashLighting || [],
        kritiNeeds: body.kritiNeeds?.trim() || null,
        notes: body.notes?.trim() || null,
      },
    });

    console.log("Events API - Event created successfully:", eventRequest.id);
    return NextResponse.json({ eventRequest }, { status: 201 });
  } catch (dbError) {
    console.error("Events API - Database error:", dbError);
    return NextResponse.json({ 
      error: "Database error: " + (dbError instanceof Error ? dbError.message : "Unknown error")
    }, { status: 500 });
  }
}
