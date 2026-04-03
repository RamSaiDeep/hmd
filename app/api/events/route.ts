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
    organizerName?: string;
    eventDate?: string;
    eventTime?: string;
    venue?: string;
    departments?: string[];
    dhwaniItems?: Array<{ item: string; quantity: string }>;
    prakashVenue?: string;
    prakashLighting?: string[];
    kritiNeeds?: string;
    notes?: string;
  };

  if (!body?.eventName?.trim() || !body?.organizerName?.trim() || !body?.eventDate?.trim() || !body?.venue?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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

  const eventRequest = await prisma.eventRequest.create({
    data: {
      eventName: body.eventName.trim(),
      organizerName: body.organizerName.trim(),
      eventDate: body.eventDate.trim(),
      eventTime: body.eventTime?.trim() || null,
      departments: body.departments || [],
      dhwaniItems: body.dhwaniItems && body.dhwaniItems.length > 0 ? body.dhwaniItems : undefined,
      prakashVenue: body.prakashVenue?.trim() || null,
      prakashLighting: body.prakashLighting || [],
      kritiNeeds: body.kritiNeeds?.trim() || null,
      notes: body.notes?.trim() || null,
    },
  });

  return NextResponse.json({ eventRequest }, { status: 201 });
}
