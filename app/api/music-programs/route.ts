import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const body = await req.json().catch(() => null) as null | {
    eventName?: string;
    organizer?: string;
    eventDate?: string;
    eventTime?: string;
    venue?: string;
    soundItems?: Array<{ item: string; quantity: string }>;
    needsLight?: boolean;
    lighting?: string[];
    notes?: string;
  };

  if (!body?.eventName?.trim() || !body?.organizer?.trim() || !body?.eventDate?.trim() || !body?.venue?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Validate sound items
  if (!body?.soundItems?.length || body.soundItems.every(item => !item.item.trim())) {
    return NextResponse.json({ error: "At least one sound item is required" }, { status: 400 });
  }

  // Ensure user exists in Prisma DB
  await prisma.user.upsert({
    where: { email: user.email! },
    update: {
      name: user.user_metadata?.name ?? undefined,
      phone: user.user_metadata?.phone ?? undefined,
      room: user.user_metadata?.room ?? undefined,
      role: user.user_metadata?.role ?? undefined,
      emailVerified: user.email_confirmed_at ? new Date(user.email_confirmed_at) : undefined,
    },
    create: {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name ?? null,
      phone: user.user_metadata?.phone ?? null,
      room: user.user_metadata?.room ?? null,
      role: user.user_metadata?.role ?? "user",
      emailVerified: user.email_confirmed_at ? new Date(user.email_confirmed_at) : null,
    },
  });

  const musicRequest = await prisma.musicRequest.create({
    data: {
      eventName: body.eventName.trim(),
      organizer: body.organizer.trim(),
      eventDate: body.eventDate.trim(),
      eventTime: body.eventTime?.trim() || null,
      venue: body.venue.trim(),
      soundItems: body.soundItems,
      needsLight: body.needsLight || false,
      lighting: body.lighting || [],
      notes: body.notes?.trim() || null,
    },
  });

  return NextResponse.json({ musicRequest }, { status: 201 });
}
