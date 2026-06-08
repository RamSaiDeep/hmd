import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { canAccessSuperuserPanel } from "@/lib/roles";
import { redirect } from "next/navigation";
import SuperUserDashboard from "./SuperUserDashboard";

export default async function SuperUserPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
  });

  if (!dbUser || !canAccessSuperuserPanel(dbUser.role)) {
    return <h1>Access Denied 🚫</h1>;
  }

  const [users, complaints, musicRequests, events, studioBookings] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.complaint.findMany({
      include: {
        user: true,
        acceptances: {
          include: {
            member: {
              select: { id: true, name: true, email: true, phone: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.musicRequest.findMany({
      include: {
        user: true,
        acceptances: {
          include: {
            member: { select: { id: true, name: true, email: true, phone: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.eventRequest.findMany({
      include: {
        acceptances: {
          include: {
            member: { select: { id: true, name: true, email: true, phone: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.studioBooking.findMany({
      include: {
        user: true,
        acceptances: {
          include: {
            member: { select: { id: true, name: true, email: true, phone: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <SuperUserDashboard
      users={users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        room: u.room,
        phone: u.phone,
        role: u.role,
      }))}
      currentUser={{ id: dbUser.id, role: dbUser.role }}
      complaints={complaints.map((c) => ({
        id: c.id,
        place: c.place,
        issueType: c.issueType,
        issueDetail: c.issueDetail,
        description: c.description,
        photoUrl: c.photoUrl,
        status: c.status,
        priority: c.priority,
        createdAt: c.createdAt.toISOString(),
        updatedBy: c.updatedBy,
        userId: c.userId,
        user: c.user ? { name: c.user.name, email: c.user.email, phone: c.user.phone } : null,
        acceptanceCount: c.acceptances.length,
        acceptedMembers: c.acceptances.map((a) => ({
          id: a.member.id,
          name: a.member.name,
          email: a.member.email,
          phone: a.member.phone,
        })),
      }))}
      musicRequests={musicRequests.map((m) => ({
        id: m.id,
        eventName: m.eventName,
        organizer: m.organizer,
        eventDate: m.eventDate,
        eventTime: m.eventTime,
        venue: m.venue,
        status: m.status,
        notes: m.notes,
        user: m.user ? { name: m.user.name, email: m.user.email, phone: m.user.phone } : null,
        createdAt: m.createdAt.toISOString(),
        acceptanceCount: m.acceptances.length,
        acceptedMembers: m.acceptances.map((a) => ({
          id: a.member.id,
          name: a.member.name,
          email: a.member.email,
          phone: a.member.phone,
        })),
      }))}
      eventRequests={events.map((e) => ({
        id: e.id,
        eventName: e.eventName,
        organizerName: e.organizerName,
        eventDate: e.eventDate,
        departments: e.departments,
        status: e.status,
        memberResponse: e.memberResponse,
        createdAt: e.createdAt.toISOString(),
        acceptanceCount: e.acceptances.length,
        acceptedMembers: e.acceptances.map((a) => ({
          id: a.member.id,
          name: a.member.name,
          email: a.member.email,
          phone: a.member.phone,
        })),
      }))}
      studioBookings={studioBookings.map((s) => ({
        id: s.id,
        day: s.day,
        slot: s.slot,
        purpose: s.purpose,
        description: s.description,
        status: s.status,
        user: s.user ? { name: s.user.name, email: s.user.email, phone: s.user.phone } : null,
        createdAt: s.createdAt.toISOString(),
        acceptanceCount: s.acceptances.length,
        acceptedMembers: s.acceptances.map((a) => ({
          id: a.member.id,
          name: a.member.name,
          email: a.member.email,
          phone: a.member.phone,
        })),
      }))}
    />
  );
}
