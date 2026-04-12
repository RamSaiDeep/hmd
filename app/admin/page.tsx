import { findAppUserForSupabaseUser } from "@/lib/app-user";
import { getPrismaClient } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  const prisma = getPrismaClient();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("/login");

  const dbUser = await findAppUserForSupabaseUser(user);

  if (!dbUser || dbUser.role !== "admin") {
    return <h1>Access Denied 🚫</h1>;
  }

  const [complaints, events, users] = await Promise.all([
    prisma.complaint.findMany({ include: { user: true }, orderBy: { createdAt: "desc" } }),
    prisma.eventRequest.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <AdminDashboard
      complaints={complaints.map((c) => ({
        id: c.id,
        place: c.place,
        issueType: c.issueType,
        issueDetail: c.issueDetail,
        status: c.status,
        priority: c.priority,
        createdAt: c.createdAt.toISOString(),
        updatedBy: c.updatedBy,
        userId: c.userId,
        user: c.user ? { name: c.user.name, email: c.user.email } : null,
      }))}
      events={events.map((e) => ({
        id: e.id,
        eventName: e.eventName,
        organizerName: e.organizerName,
        eventDate: e.eventDate,
        departments: e.departments,
        status: e.status,
        memberResponse: e.memberResponse,
      }))}
      users={users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        room: u.room,
        phone: u.phone,
        role: u.role,
      }))}
      currentUser={{ id: dbUser.id }}
    />
  );
}
