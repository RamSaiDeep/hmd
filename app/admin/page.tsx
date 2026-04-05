import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
  });

  if (!dbUser || dbUser.role !== "admin") {
    return <h1>Access Denied 🚫</h1>;
  }

  const [complaints, events, users] = await Promise.all([
    prisma.complaint.findMany({ include: { user: true }, orderBy: { createdAt: "desc" } }),
    prisma.eventRequest.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return <AdminDashboard complaints={complaints} events={events} users={users} currentUser={dbUser} />;
}
