import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { syncAuthUserToPrisma } from "@/lib/sync-user";

export async function GET() {
  try {
    // Fetch all active bookings (not cancelled)
    const bookings = await prisma.studioBooking.findMany({
      where: {
        status: { not: "Cancelled" }
      },
      select: {
        day: true,
        slot: true
      }
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("GET /api/bookings error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (
      !body ||
      !body.day ||
      !body.slot ||
      !body.purpose ||
      !body.description ||
      !body.bookingName ||
      !body.recordingTime ||
      !body.vocalOrInstrument
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Require artistName if type is Vocal or Midi
    const isVocalOrMidi = body.vocalOrInstrument === "Vocal" || body.vocalOrInstrument === "Midi";
    if (isVocalOrMidi && !body.artistName) {
      return NextResponse.json({ error: "Artist/Person name is required for Vocal/Midi" }, { status: 400 });
    }

    // Check if slot is already booked
    const existing = await prisma.studioBooking.findFirst({
      where: {
        day: body.day,
        slot: body.slot,
        status: { not: "Cancelled" }
      }
    });

    if (existing) {
      return NextResponse.json({ error: "Slot already booked" }, { status: 400 });
    }

    // Ensure user is synced
    await syncAuthUserToPrisma(user);

    const booking = await prisma.studioBooking.create({
      data: {
        userId: user.id,
        day: body.day,
        slot: body.slot,
        purpose: body.purpose,
        description: body.description,
        bookingName: body.bookingName,
        recordingTime: body.recordingTime,
        artistName: body.artistName,
        vocalOrInstrument: body.vocalOrInstrument,
        status: "Pending"
      }
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (err) {
    console.error("POST /api/bookings error:", err);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
