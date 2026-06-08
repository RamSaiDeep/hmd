import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { canAssignRole, canAccessAdminPanel, type UserRole } from "@/lib/roles";

type RoleUpdatePayload = {
  id?: string;
  role?: UserRole;
};

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

    const actor = await prisma.user.findUnique({ where: { email: user.email! } });
    if (!actor || !canAccessAdminPanel(actor.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, role } = (await request.json()) as RoleUpdatePayload;

    if (!id || !role) {
      return NextResponse.json({ error: "User id and role are required" }, { status: 400 });
    }

    if (role === "superuser") {
      return NextResponse.json({ error: "Super user role cannot be assigned here" }, { status: 400 });
    }

    if (id === actor.id) {
      return NextResponse.json({ error: "You cannot change your own role" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!canAssignRole(actor.role, targetUser.role, role)) {
      return NextResponse.json({ error: "You are not allowed to assign this role" }, { status: 403 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
    });

    try {
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
        return NextResponse.json(
          { error: `Failed to sync role in auth: ${authUpdateError.message}` },
          { status: 500 }
        );
      }
    } catch (adminError) {
      console.warn("Auth metadata sync skipped:", adminError);
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("POST /api/admin/users/role error:", error);
    return NextResponse.json({ error: "Failed to update user role" }, { status: 500 });
  }
}
