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
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return errorResponse(
      401,
      "AUTH_REQUIRED",
      "You must be logged in to view complaints.",
      error?.message,
    );
  }

  try {
    const normalizedEmail = user.email?.trim().toLowerCase();
    const dbUser =
      (await prisma.user.findUnique({ where: { id: user.id } })) ||
      (normalizedEmail
        ? await prisma.user.findUnique({ where: { email: normalizedEmail } })
        : null);

    const userIds = dbUser ? [dbUser.id] : [user.id];
    const complaints = await prisma.complaint.findMany({
      where: { userId: { in: userIds } },
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
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return errorResponse(
      401,
      "AUTH_REQUIRED",
      "Please log in before submitting a complaint.",
      error?.message,
    );
  }

  if (!user.email?.trim()) {
    return errorResponse(
      400,
      "USER_EMAIL_REQUIRED",
      "Your account email is missing. Please update your account and try again.",
    );
  }

  const body = (await req.json().catch(() => null)) as
    | null
    | {
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

  const normalizedEmail = user.email.trim().toLowerCase();
  let complaintUserId = user.id;

  try {
    const existingById = await prisma.user.findUnique({
      where: { id: user.id },
    });
    const existingByEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // If a legacy duplicate exists (same logical user split across id/email),
    // prefer the email-linked row to avoid unique-email update collisions.
    if (
      existingById &&
      existingByEmail &&
      existingById.id !== existingByEmail.id
    ) {
      await prisma.user.update({
        where: { id: existingByEmail.id },
        data: {
          name: user.user_metadata?.name ?? undefined,
          phone: user.user_metadata?.phone ?? undefined,
          room: user.user_metadata?.room ?? undefined,
          role: user.user_metadata?.role ?? undefined,
          emailVerified: user.email_confirmed_at
            ? new Date(user.email_confirmed_at)
            : undefined,
        },
      });
      complaintUserId = existingByEmail.id;
    } else if (existingById) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          email: normalizedEmail,
          name: user.user_metadata?.name ?? undefined,
          phone: user.user_metadata?.phone ?? undefined,
          room: user.user_metadata?.room ?? undefined,
          role: user.user_metadata?.role ?? undefined,
          emailVerified: user.email_confirmed_at
            ? new Date(user.email_confirmed_at)
            : undefined,
        },
      });
      complaintUserId = existingById.id;
    } else if (existingByEmail) {
      await prisma.user.update({
        where: { email: normalizedEmail },
        data: {
          name: user.user_metadata?.name ?? undefined,
          phone: user.user_metadata?.phone ?? undefined,
          room: user.user_metadata?.room ?? undefined,
          role: user.user_metadata?.role ?? undefined,
          emailVerified: user.email_confirmed_at
            ? new Date(user.email_confirmed_at)
            : undefined,
        },
      });
      complaintUserId = existingByEmail.id;
    } else {
      const createdUser = await prisma.user.create({
        data: {
          id: user.id,
          email: normalizedEmail,
          name: user.user_metadata?.name ?? null,
          phone: user.user_metadata?.phone ?? null,
          room: user.user_metadata?.room ?? null,
          role: user.user_metadata?.role ?? "user",
          emailVerified: user.email_confirmed_at
            ? new Date(user.email_confirmed_at)
            : null,
        },
      });
      complaintUserId = createdUser.id;
    }
  } catch (upsertError) {
    const syncErrorDetails =
      upsertError instanceof Error
        ? upsertError.message
        : typeof upsertError === "string"
          ? upsertError
          : JSON.stringify(upsertError);

    return errorResponse(
      500,
      "USER_SYNC_FAILED",
      "Failed to sync user record before complaint submission.",
      syncErrorDetails,
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