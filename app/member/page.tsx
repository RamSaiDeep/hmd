import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { canAccessMemberDashboard } from "@/lib/roles";
import { redirect } from "next/navigation";
import MemberDashboard from "./MemberDashboard";

type MemberView = "all" | "mine" | "events" | "music" | "studio";

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

  if (!dbUser || !canAccessMemberDashboard(dbUser.role)) {
    return <h1>Access Denied 🚫</h1>;
  }

  const complaints = await prisma.complaint.findMany({
    include: {
      user: true,
      acceptances: {
        include: {
          member: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const events = await prisma.eventRequest.findMany({
    include: {
      acceptances: {
        include: {
          member: { select: { id: true, name: true, email: true, phone: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const musicRequests = await prisma.musicRequest.findMany({
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
  });

  const studioBookings = await prisma.studioBooking.findMany({
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
  });

  const settingsItems = await prisma.systemSetting.findMany();
  const settings = settingsItems.reduce((acc: Record<string, string>, s: { key: string; value: string }) => {
    acc[s.key] = s.value;
    return acc;
  }, {} as Record<string, string>);

  const params = await searchParams;
  const viewParam = Array.isArray(params.view) ? params.view[0] : params.view;
  const initialView: MemberView =
    viewParam === "mine" || viewParam === "events" || viewParam === "music" || viewParam === "studio" ? viewParam : "all";

  return (
    <MemberDashboard
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
        acceptedMembers: c.acceptances.map((acceptance) => ({
          id: acceptance.member.id,
          name: acceptance.member.name,
          email: acceptance.member.email,
          phone: acceptance.member.phone,
        })),
      }))}
      events={events.map((e) => ({
        id: e.id,
        eventName: e.eventName,
        organizerName: e.organizerName,
        eventDate: e.eventDate,
        departments: e.departments,
        status: e.status,
        memberResponse: e.memberResponse,
        acceptanceCount: e.acceptances.length,
        acceptedMembers: e.acceptances.map((a) => ({
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
        soundItems: m.soundItems,
        needsLight: m.needsLight,
        lighting: m.lighting,
        notes: m.notes,
        status: m.status,
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
      studioBookings={studioBookings.map((s) => ({
        id: s.id,
        day: s.day,
        slot: s.slot,
        purpose: s.purpose,
        description: s.description,
        bookingName: s.bookingName,
        recordingTime: s.recordingTime,
        artistName: s.artistName,
        vocalOrInstrument: s.vocalOrInstrument,
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
      settings={settings}
      currentUser={{ id: dbUser.id }}
      initialView={initialView}
    />
  );
}
