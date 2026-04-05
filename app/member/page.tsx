import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MemberDashboard from "./MemberDashboard";

export default async function MemberPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
  });

  if (!dbUser || (dbUser.role !== "member" && dbUser.role !== "admin")) {
    return <h1>Access Denied 🚫</h1>;
  }

  const complaints = await prisma.complaint.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  const events = await prisma.eventRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <MemberDashboard
      complaints={complaints}
      events={events}
      currentUser={dbUser}
    />
  );
}