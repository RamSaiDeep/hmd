import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { canAccessAdminPanel, canDeleteUser } from "@/lib/roles";

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

    const { id } = (await request.json()) as { id?: string };

    if (!id) {
      return NextResponse.json({ error: "User id is required" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!canDeleteUser(actor.role, targetUser.role, actor.id, targetUser.id)) {
      return NextResponse.json({ error: "You cannot delete this user" }, { status: 403 });
    }

    const supabaseAdmin = createAdminClient();
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (authDeleteError) {
      return NextResponse.json({ error: `Failed to delete auth user: ${authDeleteError.message}` }, { status: 500 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/admin/users/delete error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
