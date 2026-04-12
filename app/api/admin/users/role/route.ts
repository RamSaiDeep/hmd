export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type RoleUpdatePayload = {
  id?: string;
  role?: "user" | "member";
};

export async function POST(request: Request) {
  try {
    const prisma = getPrismaClient();
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({ where: { email: user.email! } });
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, role } = (await request.json()) as RoleUpdatePayload;

    if (!id || !role) {
      return NextResponse.json({ error: "User id and role are required" }, { status: 400 });
    }

    if (role !== "user" && role !== "member") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    if (id === admin.id) {
      return NextResponse.json({ error: "You cannot change your own role" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (targetUser.role === "admin") {
      return NextResponse.json({ error: "Admin role cannot be changed here" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
    });

    const supabaseAdmin = createAdminClient();
    const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(id, {
      user_metadata: {
        ...(targetUser.name ? { name: targetUser.name } : {}),
        ...(targetUser.phone ? { phone: targetUser.phone } : {}),
        ...(targetUser.room ? { room: targetUser.room } : {}),
        role,
      },
    });

    if (authUpdateError) {
      return NextResponse.json({ error: `Failed to sync role in auth: ${authUpdateError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("POST /api/admin/users/role error:", error);
    return NextResponse.json({ error: "Failed to update user role" }, { status: 500 });
  }
}
