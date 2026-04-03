import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

function errorResponse(
  status: number,
  code: string,
  message: string,
  details?: string,
) {
  return NextResponse.json(
    {
      error: message,
      code,
      details,
    },
    { status },
  );
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return errorResponse(
      401,
      "AUTH_REQUIRED",
      "You must be logged in to view complaints.",
      error?.message,
    );
  }

  try {
    const complaints = await prisma.complaint.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ complaints });
  } catch (dbError) {
    return errorResponse(
      500,
      "COMPLAINTS_FETCH_FAILED",
      "Unable to load complaints right now. Please try again in a moment.",
      dbError instanceof Error ? dbError.message : "Unknown database error",
    );
  }
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return errorResponse(
      401,
      "AUTH_REQUIRED",
      "Please log in before submitting a complaint.",
      error?.message,
    );
  }

  const body = (await req.json().catch(() => null)) as null | {
    place?: string;
    issueType?: string;
    issueDetail?: string;
    description?: string;
  };

  if (!body) {
    return errorResponse(
      400,
      "INVALID_JSON_BODY",
      "Request body is not valid JSON.",
    );
  }

  if (!body.place?.trim()) {
    return errorResponse(
      400,
      "PLACE_REQUIRED",
      "Room/Place is required to submit a complaint.",
    );
  }

  if (!body.issueType?.trim()) {
    return errorResponse(
      400,
      "ISSUE_TYPE_REQUIRED",
      "Issue type is required to submit a complaint.",
    );
  }

  if (body.issueType.trim() === "Other" && !body.issueDetail?.trim()) {
    return errorResponse(
      400,
      "ISSUE_DETAIL_REQUIRED",
      "Please describe the issue when issue type is 'Other'.",
    );
  }

  try {
    await prisma.$connect();
  } catch (connectError) {
    return errorResponse(
      500,
      "DB_CONNECTION_FAILED",
      "Database connection failed while submitting complaint.",
      connectError instanceof Error
        ? connectError.message
        : "Unknown connection error",
    );
  }

  let complaintUserId = user.id;
  try {
    await prisma.user.upsert({
      where: { email: user.email! },
      update: {
        email: normalizedEmail,
        name: user.user_metadata?.name ?? undefined,
        phone: user.user_metadata?.phone ?? undefined,
        room: user.user_metadata?.room ?? undefined,
        role: user.user_metadata?.role ?? undefined,
        emailVerified: user.email_confirmed_at ? new Date(user.email_confirmed_at) : undefined,
      },
      create: {
        id: user.id,
        email: normalizedEmail,
        name: user.user_metadata?.name ?? null,
        phone: user.user_metadata?.phone ?? null,
        room: user.user_metadata?.room ?? null,
        role: user.user_metadata?.role ?? "user",
        emailVerified: user.email_confirmed_at ? new Date(user.email_confirmed_at) : null,
      },
    });
  } catch (upsertError) {
    return errorResponse(
      500,
      "USER_SYNC_FAILED",
      "Failed to sync user record before complaint submission.",
      upsertError instanceof Error ? upsertError.message : "Unknown sync error",
    );
  }

  try {
    const complaint = await prisma.complaint.create({
      data: {
        userId: complaintUserId,
        place: body.place.trim(),
        issueType: body.issueType.trim(),
        issueDetail: body.issueDetail?.trim() || null,
        description: body.description?.trim() || null,
      },
    });
    return NextResponse.json({ complaint }, { status: 201 });
  } catch (dbError) {
    if (dbError instanceof Prisma.PrismaClientKnownRequestError) {
      if (dbError.code === "P2003") {
        return errorResponse(
          500,
          "USER_REFERENCE_INVALID",
          "Your user record is not linked correctly. Please log out and log back in, then try again.",
          dbError.message,
        );
      }

      if (dbError.code === "P2002") {
        return errorResponse(
          409,
          "DUPLICATE_COMPLAINT",
          "A complaint with this data already exists.",
          dbError.message,
        );
      }
    }

    return errorResponse(
      500,
      "COMPLAINT_CREATE_FAILED",
      "Complaint could not be saved due to a server error.",
      dbError instanceof Error ? dbError.message : "Unknown database error",
    );
  }
}
