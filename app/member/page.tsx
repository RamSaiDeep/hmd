import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MemberDashboard from "./MemberDashboard";

type MemberView = "all" | "mine" | "events";

export default async function MemberPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string | string[] }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  const params = await searchParams;
  const viewParam = Array.isArray(params.view) ? params.view[0] : params.view;
  const initialView: MemberView =
    viewParam === "mine" || viewParam === "events" ? viewParam : "all";

  return (
    <MemberDashboard
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
      currentUser={{ id: dbUser.id }}
      initialView={initialView}
    />
  );
}
