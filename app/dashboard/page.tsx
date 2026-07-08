import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { parseUserRole } from "@/lib/roles";
import { redirect } from "next/navigation";
import UserDashboard from "./UserDashboard";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("/login");

  const dbUser = user.email
    ? await prisma.user.findUnique({ where: { email: user.email } })
    : null;

  const settingsItems = await prisma.systemSetting.findMany();
  const settings = settingsItems.reduce((acc: Record<string, string>, s: { key: string; value: string }) => {
    acc[s.key] = s.value;
    return acc;
  }, {} as Record<string, string>);
  const complaintAcceptanceLimit = parseInt(settings.COMPLAINT_ACCEPTANCE_LIMIT || "2", 10);

  const [complaints, musicRequests, eventRequests, studioBookings] = await Promise.all([
    dbUser
      ? prisma.complaint.findMany({
          where: { userId: dbUser.id },
          include: {
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
        })
      : Promise.resolve([]),
    prisma.musicRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.eventRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.studioBooking.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <UserDashboard
      userName={user.user_metadata?.name ?? user.email}
      userRoom={user.user_metadata?.room ?? ""}
      userRole={parseUserRole(dbUser?.role)}
      complaintAcceptanceLimit={complaintAcceptanceLimit}
      complaints={complaints.map((complaint) => {
        const acceptanceCount = complaint.acceptances.length;
        return {
          ...complaint,
          createdAt: complaint.createdAt.toISOString(),
          acceptanceCount,
          acceptedMembers:
            acceptanceCount >= complaintAcceptanceLimit
              ? complaint.acceptances.map((acceptance) => ({
                  id: acceptance.member.id,
                  name: acceptance.member.name,
                  email: acceptance.member.email,
                  phone: acceptance.member.phone,
                }))
              : [],
        };
      })}
      musicRequests={musicRequests.map((request) => ({
        id: request.id,
        eventName: request.eventName,
        organizer: request.organizer,
        eventDate: request.eventDate,
        eventTime: request.eventTime,
        venue: request.venue,
        soundItems: request.soundItems,
        needsLight: request.needsLight,
        lighting: request.lighting,
        notes: request.notes,
        status: request.status,
        adminResponse: request.adminResponse,
        alternativeDate: request.alternativeDate,
        alternativeTime: request.alternativeTime,
        alternativeVenue: request.alternativeVenue,
        alternativeSoundItems: request.alternativeSoundItems,
        alternativeLighting: request.alternativeLighting,
        alternativeNotes: request.alternativeNotes,
        createdAt: request.createdAt.toISOString(),
      }))}
      eventRequests={eventRequests.map((request) => ({
        id: request.id,
        eventName: request.eventName,
        organizerName: request.organizerName,
        eventDate: request.eventDate,
        eventTime: request.eventTime,
        departments: request.departments,
        dhwaniItems: request.dhwaniItems,
        prakashVenue: request.prakashVenue,
        prakashLighting: request.prakashLighting,
        kritiNeeds: request.kritiNeeds,
        notes: request.notes,
        status: request.status,
        memberResponse: request.memberResponse,
        createdAt: request.createdAt.toISOString(),
      }))}
      studioBookings={studioBookings.map((booking) => ({
        id: booking.id,
        day: booking.day,
        slot: booking.slot,
        purpose: booking.purpose,
        description: booking.description,
        bookingName: booking.bookingName,
        recordingTime: booking.recordingTime,
        artistName: booking.artistName,
        vocalOrInstrument: booking.vocalOrInstrument,
        status: booking.status,
        createdAt: booking.createdAt.toISOString(),
      }))}
    />
  );
}
