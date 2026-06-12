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
    const bookings = await prisma.studioBooking.findMany({
      where: {
        userId: user.id
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ 
      bookings: bookings.map((booking) => ({
        id: booking.id,
        day: booking.day,
        slot: booking.slot,
        purpose: booking.purpose,
        description: booking.description,
        bookingName: booking.bookingName,
        recordingTime: booking.recordingTime,
        artistName: booking.artistName,
        vocalOrInstrument: booking.vocalOrInstrument,
        status: booking.status,
        createdAt: booking.createdAt.toISOString()
      }))
    });
  } catch (error) {
    console.error("GET /api/user/bookings error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}
