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

  const [complaints, events, musicRequests, users] = await Promise.all([
    prisma.complaint.findMany({ include: { user: true }, orderBy: { createdAt: "desc" } }),
    prisma.eventRequest.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.musicRequest.findMany({ 
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <AdminDashboard
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
      musicRequests={musicRequests.map((m) => ({
        id: m.id,
        eventName: m.eventName,
        organizer: m.organizer,
        eventDate: m.eventDate,
        eventTime: m.eventTime,
        venue: m.venue,
        soundItems: m.soundItems as any,
        needsLight: m.needsLight,
        lighting: m.lighting,
        notes: m.notes,
        status: m.status,
        adminResponse: m.adminResponse,
        alternativeDate: m.alternativeDate,
        alternativeTime: m.alternativeTime,
        alternativeVenue: m.alternativeVenue,
        alternativeSoundItems: m.alternativeSoundItems,
        alternativeLighting: m.alternativeLighting,
        alternativeNotes: m.alternativeNotes,
        user: m.user ? { name: m.user.name, email: m.user.email } : null,
        createdAt: m.createdAt.toISOString(),
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
