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
    const { id, status, priority } = body as {
      id?: string;
      status?: string;
      priority?: string;
    };

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Complaint id is required" }, { status: 400 });
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

    const complaint = await prisma.complaint.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ complaint });
  } catch (error) {
    console.error("POST /api/complaints/update error:", error);
    return NextResponse.json({ error: "Failed to update complaint" }, { status: 500 });
  }
}
