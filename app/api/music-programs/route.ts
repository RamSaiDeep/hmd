import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type SoundItem = {
  item?: string;
  quantity?: string;
};

type MusicRequestBody = {
  eventName?: string;
  organizer?: string;
  eventDate?: string;
  eventTime?: string;
  venue?: string;
  soundItems?: SoundItem[];
  needsLight?: boolean;
  lighting?: string[];
  notes?: string;
};

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as MusicRequestBody | null;

  if (!body?.eventName?.trim() || !body?.organizer?.trim() || !body?.eventDate?.trim() || !body?.venue?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Validate sound items
  if (!body?.soundItems?.length || body.soundItems.every((item) => !item.item?.trim() || !item.quantity?.trim())) {
    return NextResponse.json({ error: "At least one sound item is required" }, { status: 400 });
  }

  try {
    // Ensure user exists in database (inline sync logic)
    console.log("Music Programs API - Ensuring user sync for:", user.email);
    
    // Check if user exists in database
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email! }
    });

    if (!existingUser) {
      console.log("Music Programs API - Creating new user in database");
      // Create new user
      const newUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || user.email?.split('@')[0] || null,
          phone: user.user_metadata?.phone || null,
          room: user.user_metadata?.room || null,
          role: user.user_metadata?.role || "user",
          emailVerified: user.email_confirmed_at ? new Date(user.email_confirmed_at) : null,
        },
      });
      console.log("Music Programs API - User created successfully:", newUser.email);
    } else {
      console.log("Music Programs API - User already exists");
    }

    const musicRequest = await prisma.musicRequest.create({
      data: {
        userId: user.id,
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
