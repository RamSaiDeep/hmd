import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const allowedStatuses = ["Not Started", "In Progress", "Finished", "Invalid Request"];
const allowedPriorities = ["Low", "Medium", "High"];

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    });

    if (!dbUser || (dbUser.role !== "member" && dbUser.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id, status, priority, action } = body as {
      id?: string;
      status?: string;
      priority?: string;
      action?: string;
    };

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Complaint id is required" }, { status: 400 });
    }

    if (action === "accept") {
      if (dbUser.role !== "member" && dbUser.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const acceptanceCount = await prisma.complaintAcceptance.count({
        where: { complaintId: id },
      });

      if (acceptanceCount >= 2) {
        return NextResponse.json({ error: "This complaint already has two accepted members" }, { status: 400 });
      }

      try {
        const acceptance = await prisma.complaintAcceptance.create({
          data: {
            complaintId: id,
            memberId: dbUser.id,
          },
        });

        const updatedCount = await prisma.complaintAcceptance.count({
          where: { complaintId: id },
        });

        return NextResponse.json({
          acceptance,
          acceptanceCount: updatedCount,
          finalized: updatedCount >= 2,
        });
      } catch {
        return NextResponse.json({ error: "You have already accepted this complaint" }, { status: 400 });
      }
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        acceptances: {
          select: { memberId: true },
        },
      },
    });

    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
    }

    const acceptedMemberIds = complaint.acceptances.map((acceptance) => acceptance.memberId);
    const isAcceptedMember = acceptedMemberIds.includes(dbUser.id);

    if (dbUser.role !== "admin" && !isAcceptedMember) {
      return NextResponse.json({ error: "Only assigned members can update this complaint" }, { status: 403 });
    }

    if (dbUser.role !== "admin" && complaint.acceptances.length < 2) {
      return NextResponse.json({ error: "Complaint needs two accepting members before updates" }, { status: 400 });
    }

    const dataToUpdate: { status?: string; priority?: string; updatedBy?: string } = {};

    if (typeof status !== "undefined") {
      if (!allowedStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      dataToUpdate.status = status;
    }

    if (typeof priority !== "undefined") {
      if (!allowedPriorities.includes(priority)) {
        return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
      }
      dataToUpdate.priority = priority;
    }

    if (!dataToUpdate.status && !dataToUpdate.priority) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    dataToUpdate.updatedBy = dbUser.name || dbUser.email;

    const updatedComplaint = await prisma.complaint.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ complaint: updatedComplaint });
  } catch (error) {
    console.error("POST /api/complaints/update error:", error);
    return NextResponse.json({ error: "Failed to update complaint" }, { status: 500 });
  }
}
