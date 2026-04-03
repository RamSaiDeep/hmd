import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const complaints = await prisma.complaint.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ complaints });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  console.log("Complaint API - User check:", { user: user?.email, error: error?.message });

  if (error || !user) {
    console.log("Complaint API - Authentication failed");
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const body = await req.json().catch(() => null) as null | {
    place?: string;
    issueType?: string;
    issueDetail?: string;
    description?: string;
  };

  console.log("Complaint API - Request body:", body);

  if (!body?.place?.trim() || !body?.issueType?.trim()) {
    console.log("Complaint API - Missing required fields");
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Test database connection first
  try {
    console.log("Complaint API - Testing database connection...");
    await prisma.$connect();
    console.log("Complaint API - Database connection successful");
    
    // Test a simple query
    const testUser = await prisma.user.findFirst();
    console.log("Complaint API - Database query test, found user:", testUser?.email || "No users found");
  } catch (connectError) {
    console.error("Complaint API - Database connection failed:", connectError);
    return NextResponse.json({ 
      error: "Database connection failed: " + (connectError instanceof Error ? connectError.message : "Unknown connection error") 
    }, { status: 500 });
  }

  try {
    // Ensure user exists in Prisma DB (sync route normally does this, but keep API robust)
    console.log("Complaint API - Attempting user sync for:", user.email);
    
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

    console.log("Complaint API - User synced successfully");

    console.log("Complaint API - Attempting to create complaint with data:", {
      userId: user.id,
      place: body.place.trim(),
      issueType: body.issueType.trim(),
      issueDetail: body.issueDetail?.trim() || null,
      description: body.description?.trim() || null,
    });

    const complaint = await prisma.complaint.create({
      data: {
        userId: user.id,
        place: body.place.trim(),
        issueType: body.issueType.trim(),
        issueDetail: body.issueDetail?.trim() || null,
        description: body.description?.trim() || null,
      },
    });

    console.log("Complaint API - Complaint created successfully:", complaint.id);
    return NextResponse.json({ complaint }, { status: 201 });
  } catch (dbError) {
    console.error("Complaint API - Raw database error:", dbError);
    console.error("Complaint API - Error type:", typeof dbError);
    console.error("Complaint API - Error constructor:", dbError?.constructor?.name);
    
    let errorMessage = "Unknown database error";
    if (dbError instanceof Error) {
      errorMessage = dbError.message;
    } else if (typeof dbError === 'string') {
      errorMessage = dbError;
    } else if (dbError && typeof dbError === 'object') {
      errorMessage = JSON.stringify(dbError);
    }
    
    console.error("Complaint API - Final error message:", errorMessage);
    
    return NextResponse.json({ 
      error: "Database error: " + errorMessage,
      rawError: dbError
    }, { status: 500 });
  }
}

