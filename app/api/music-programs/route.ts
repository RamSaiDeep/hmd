import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const body = await req.json().catch(() => null) as any;

  if (!body?.eventName?.trim() || !body?.organizer?.trim() || !body?.eventDate?.trim() || !body?.venue?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Validate sound items
  if (!body?.soundItems?.length || body.soundItems.every((item: any) => !item.item?.trim() || !item.quantity?.trim())) {
    return NextResponse.json({ error: "At least one sound item is required" }, { status: 400 });
  }

  try {
    // Ensure user exists in database using the sync API
    console.log("Music Programs API - Ensuring user sync for:", user.email);
    
    const syncResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/user/ensure-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!syncResponse.ok) {
      const syncError = await syncResponse.json().catch(() => ({}));
      console.error("Music Programs API - User sync failed:", syncError);
      return NextResponse.json({ 
        error: "User sync failed: " + (syncError.error || "Unknown sync error") 
      }, { status: 500 });
    }

    const syncResult = await syncResponse.json();
    console.log("Music Programs API - User sync successful:", syncResult.message);

    const musicRequest = await prisma.musicRequest.create({
      data: {
        eventName: body.eventName.trim(),
        organizer: body.organizer.trim(),
        eventDate: body.eventDate.trim(),
        eventTime: body.eventTime?.trim() || null,
        venue: body.venue.trim(),
        soundItems: body.soundItems,
        needsLight: body.needsLight || false,
        lighting: body.needsLight ? (body.lighting || []) : [],
        notes: body.notes?.trim() || null,
      },
    });

    console.log("Music Programs API - Music request created successfully:", musicRequest.id);
    return NextResponse.json({ musicRequest }, { status: 201 });
  } catch (dbError) {
    console.error("Music Programs API - Database error:", dbError);
    return NextResponse.json({ 
      error: "Database error: " + (dbError instanceof Error ? dbError.message : "Unknown error")
    }, { status: 500 });
  }
}
