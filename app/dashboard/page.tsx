"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";
import {
  canAccessAdminPanel,
  canAccessMemberDashboard,
  canAccessSuperuserPanel,
  getRoleBadgeClass,
  getRoleLabel,
  parseUserRole,
} from "@/lib/roles";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatTimeTo12Hour(timeStr?: string | null): string {
  if (!timeStr) return "—";
  if (timeStr.toUpperCase().includes("AM") || timeStr.toUpperCase().includes("PM")) {
    return timeStr;
  }
  const parts = timeStr.split(":");
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    if (!isNaN(hours)) {
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 should be 12
      return `${hours}:${minutes} ${ampm}`;
    }
  }
  return timeStr;
}

export default function DashboardPage() {

  const [user, setUser] = useState<User | null>(null);
  const [complaints, setComplaints] = useState<
    Array<{
      id: string;
      place: string;
      issueType: string;
      issueDetail?: string | null;
      description?: string | null;
      photoUrl?: string | null;
      status: string;
      priority: string;
      createdAt: string;
      acceptanceCount: number;
      acceptedMembers: Array<{
        id: string;
        name?: string | null;
        email?: string | null;
        phone?: string | null;
      }>;
    }>
  >([]);
  const [musicRequests, setMusicRequests] = useState<any[]>([]);
  const [eventRequests, setEventRequests] = useState<any[]>([]);
  const [studioBookings, setStudioBookings] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("user");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  async function loadDashboard() {
    try {
      // Get current user
      const { data: { user }, error } = await supabase.auth.getUser();

      console.log("Dashboard - user:", user?.email ?? "not logged in");

      // Redirect to login if not logged in
      if (!user || error) {
        router.push("/login");
        return;
      }

      setUser(user);

      await fetch("/api/auth/sync-user", { method: "POST" });

      // Fetch user role
      try {
        const roleResponse = await fetch("/api/user/me", { cache: "no-store" });
        if (roleResponse.ok) {
          const roleData = await roleResponse.json();
          setUserRole(parseUserRole(roleData.role));
        }
      } catch (roleError) {
        console.error("Role fetch error:", roleError);
        setUserRole("user");
      }

      // Fetch complaints, music requests, event requests, and studio bookings
      try {
        const [complaintsResponse, musicResponse, eventsResponse, bookingsResponse] = await Promise.all([
          fetch("/api/complaints"),
          fetch("/api/user/music-requests"),
          fetch("/api/user/event-requests"),
          fetch("/api/user/bookings")
        ]);
        
        if (complaintsResponse.ok) {
          const complaintsData = await complaintsResponse.json();
          setComplaints(complaintsData.complaints || []);
        }
        
        if (musicResponse.ok) {
          const musicData = await musicResponse.json();
          setMusicRequests(musicData.musicRequests || []);
        }

        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          setEventRequests(eventsData.eventRequests || []);
        }

        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          setStudioBookings(bookingsData.bookings || []);
        }
      } catch (dbError) {
        console.error("Database error:", dbError);
      }
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [complaintsResponse, musicResponse, eventsResponse, bookingsResponse] = await Promise.all([
          fetch("/api/complaints"),
          fetch("/api/user/music-requests"),
          fetch("/api/user/event-requests"),
          fetch("/api/user/bookings")
        ]);
        
        if (complaintsResponse.ok) {
          const complaintsData = await complaintsResponse.json();
          setComplaints(complaintsData.complaints || []);
        }
        
        if (musicResponse.ok) {
          const musicData = await musicResponse.json();
          setMusicRequests(musicData.musicRequests || []);
        }

        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          setEventRequests(eventsData.eventRequests || []);
        }

        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          setStudioBookings(bookingsData.bookings || []);
        }
      } catch (error) {
        console.error("Auto-refresh error:", error);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Refresh when window gains focus
  useEffect(() => {
    const handleFocus = () => {
      loadDashboard();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  async function handleAlternativeResponse(id: string, action: 'accept' | 'reject') {
    try {
      const response = await fetch('/api/user/music-requests/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      if (response.ok) {
        setMusicRequests(prev => prev.map(r => r.id === id ? { ...r, status: action === 'accept' ? 'Alternative Accepted' : 'Alternative Rejected' } : r));
      } else {
        alert("Failed to respond. Please try again.");
      }
    } catch (e) {
      console.error(e);
      alert("Error processing response.");
    }
  }

  if (loading) {
    return <div className="mx-auto w-full max-w-5xl px-4 py-8">Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect
  }

  const userName = user.user_metadata?.name ?? user.email;
  const userRoom = user.user_metadata?.room ?? "";

  function ContactReveal({
    label,
    email,
    phone,
  }: {
    label: string;
    email?: string | null;
    phone?: string | null;
  }) {
    return (
      <details>
        <summary className="cursor-pointer text-blue-600 hover:underline">{label}</summary>
        <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
          <div>Email: {email || "—"}</div>
          <div>Phone: {phone || "—"}</div>
        </div>
      </details>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-semibold">My Dashboard</h1>
            <span className={`text-xs px-2 py-1 rounded ${getRoleBadgeClass(userRole)}`}>
              {getRoleLabel(userRole)}
            </span>
          </div>
          <p className="text-muted-foreground">Welcome back, {userName}</p>
          {userRoom && <p className="text-muted-foreground">Room: {userRoom}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/register-complaint"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            New complaint
          </Link>
          <Link
            href="/category/events"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Event support
          </Link>
          <Link
            href="/category/music-programs"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Music request
          </Link>
          <Link
            href="/category/srdrs"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            SRDRS booking
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">My Complaints</h2>
          <span className="text-sm text-muted-foreground">{complaints.length}</span>
        </div>

        {complaints.length === 0 ? (
          <p className="mt-4 text-muted-foreground">No complaints yet</p>
        ) : (
          <div className="mt-4 rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Place</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Photo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Accepted By</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complaints.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.place}</TableCell>
                    <TableCell>
                      <div className="font-medium">{c.issueType}</div>
                      {c.issueDetail && <div className="text-sm text-muted-foreground">{c.issueDetail}</div>}
                    </TableCell>
                    <TableCell className="whitespace-pre-wrap max-w-xs align-top">
                      {c.description || "—"}
                    </TableCell>
                    <TableCell>
                      {c.photoUrl ? (
                        <button
                          onClick={() => setSelectedImage(c.photoUrl!)}
                          className="text-blue-500 hover:underline"
                        >
                          View
                        </button>
                      ) : "—"}
                    </TableCell>
                    <TableCell>{c.status}</TableCell>
                    <TableCell>{c.priority}</TableCell>
                    <TableCell>
                      {c.acceptanceCount >= 2 ? (
                        <div className="space-y-1">
                          {c.acceptedMembers.map((member) => (
                            <ContactReveal
                              key={member.id}
                              label={member.name || member.email || "Member"}
                              email={member.email}
                              phone={member.phone}
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">{c.acceptanceCount}/2 accepted</span>
                      )}
                    </TableCell>
                    <TableCell>{dateFormatter.format(new Date(c.createdAt))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Music Requests Section */}
      <div className="mt-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">My Music Requests</h2>
          <span className="text-sm text-muted-foreground">{musicRequests.length}</span>
        </div>

        {musicRequests.length === 0 ? (
          <p className="mt-4 text-muted-foreground">No music requests yet</p>
        ) : (
          <div className="mt-4 space-y-4">
            {musicRequests.map((request) => (
              <div key={request.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{request.eventName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {request.eventDate} {request.eventTime && `at ${formatTimeTo12Hour(request.eventTime)}`} - {request.venue}
                    </p>

                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    request.status === 'Accepted' || request.status === 'Alternative Accepted' ? 'bg-green-100 text-green-800' :
                    request.status === 'Rejected' || request.status === 'Alternative Rejected' ? 'bg-red-100 text-red-800' :
                    request.status === 'Alternative Offered' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {request.status}
                  </span>
                </div>

                {/* Sound Requirements */}
                {Array.isArray(request.soundItems) && request.soundItems.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-foreground mb-1">Sound Requirements:</p>
                    <div className="flex flex-wrap gap-1">
                      {(request.soundItems as any[]).map((item: any, index: number) => (
                        <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {item.item} ({item.quantity})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lighting Requirements */}
                {request.needsLight && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-foreground mb-1">Lighting Requirements:</p>
                    <div className="flex flex-wrap gap-1">
                      {request.lighting.map((light: string, index: number) => (
                        <span key={index} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          {light}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Response */}
                {request.adminResponse && (
                  <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium text-foreground mb-1">Admin Response:</p>
                    <p className="text-sm text-muted-foreground">{request.adminResponse}</p>
                  </div>
                )}

                {/* Alternative Arrangement */}
                {(request.status === 'Alternative Offered' || request.status === 'Alternative Accepted' || request.status === 'Alternative Rejected') && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-2">Alternative Arrangement:</p>
                    <div className="space-y-1 text-sm text-blue-800">
                      {request.alternativeDate && <p><strong>Date:</strong> {request.alternativeDate}</p>}
                      {request.alternativeTime && <p><strong>Time:</strong> {formatTimeTo12Hour(request.alternativeTime)}</p>}

                      {request.alternativeVenue && <p><strong>Venue:</strong> {request.alternativeVenue}</p>}
                      {Array.isArray(request.alternativeSoundItems) && request.alternativeSoundItems.length > 0 && (
                        <div>
                          <strong>Sound Items:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(request.alternativeSoundItems as any[]).map((item: any, index: number) => (
                              <span key={index} className="text-xs bg-blue-200 text-blue-900 px-2 py-1 rounded">
                                {item.item} ({item.quantity})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {request.alternativeLighting && request.alternativeLighting.length > 0 && (
                        <div>
                          <strong>Lighting:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {request.alternativeLighting.map((light: string, index: number) => (
                              <span key={index} className="text-xs bg-purple-200 text-purple-900 px-2 py-1 rounded">
                                {light}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {request.alternativeNotes && <p><strong>Notes:</strong> {request.alternativeNotes}</p>}
                    </div>

                    <div className="mt-4 flex gap-2">
                       <button 
                         onClick={() => handleAlternativeResponse(request.id, 'accept')} 
                         className={`${request.status === 'Alternative Accepted' ? 'bg-green-700 ring-2 ring-green-900 ring-offset-1' : 'bg-green-600'} hover:bg-green-700 text-white rounded-md px-3 py-1.5 text-xs font-medium tracking-wide transition`}
                       >
                         {request.status === 'Alternative Accepted' ? '✓ Alternative Accepted' : 'Accept Alternative'}
                       </button>
                       <button 
                         onClick={() => handleAlternativeResponse(request.id, 'reject')} 
                         className={`${request.status === 'Alternative Rejected' ? 'bg-red-700 ring-2 ring-red-900 ring-offset-1' : 'bg-red-600'} hover:bg-red-700 text-white rounded-md px-3 py-1.5 text-xs font-medium tracking-wide transition`}
                       >
                         {request.status === 'Alternative Rejected' ? '✕ Alternative Rejected' : 'Reject Alternative'}
                       </button>
                    </div>
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-3">
                  Submitted: {dateFormatter.format(new Date(request.createdAt))}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Events Section */}
      <div className="mt-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">My Event Support Requests</h2>
          <span className="text-sm text-muted-foreground">{eventRequests.length}</span>
        </div>

        {eventRequests.length === 0 ? (
          <p className="mt-4 text-muted-foreground">No event support requests yet</p>
        ) : (
          <div className="mt-4 space-y-4">
            {eventRequests.map((request) => (
              <div key={request.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{request.eventName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {request.eventDate} {request.eventTime && `at ${formatTimeTo12Hour(request.eventTime)}`} - Organizer: {request.organizerName}
                    </p>

                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    request.status === 'Confirmed' || request.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                    request.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {request.status}
                  </span>
                </div>

                {/* Departments */}
                {request.departments && request.departments.length > 0 && (
                  <div className="mb-2">
                    <p className="text-sm font-medium text-foreground mb-1">Departments:</p>
                    <div className="flex flex-wrap gap-1">
                      {request.departments.map((dept: string, idx: number) => (
                        <span key={idx} className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                          {dept}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Member/Admin Response */}
                {request.memberResponse && (
                  <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium text-foreground mb-1">Response:</p>
                    <p className="text-sm text-muted-foreground">{request.memberResponse}</p>
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-3">
                  Submitted: {dateFormatter.format(new Date(request.createdAt))}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SRDRS Bookings Section */}
      <div className="mt-8 mb-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">My SRDRS Bookings</h2>
          <span className="text-sm text-muted-foreground">{studioBookings.length}</span>
        </div>

        {studioBookings.length === 0 ? (
          <p className="mt-4 text-muted-foreground">No bookings yet</p>
        ) : (
          <div className="mt-4 rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Slot</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Recording Time</TableHead>
                  <TableHead>Artist Name</TableHead>
                  <TableHead>Vocal/Instrument</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Booked</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studioBookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-semibold">{b.day}</TableCell>
                    <TableCell>{formatTimeTo12Hour(b.slot)}</TableCell>
                    <TableCell>{b.bookingName || "—"}</TableCell>
                    <TableCell>{formatTimeTo12Hour(b.recordingTime)}</TableCell>

                    <TableCell>{b.artistName || "—"}</TableCell>
                    <TableCell>{b.vocalOrInstrument || "—"}</TableCell>
                    <TableCell>{b.purpose}</TableCell>
                    <TableCell className="whitespace-pre-wrap max-w-xs align-top">
                      {b.description || "—"}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded ${
                        b.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                        b.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {b.status}
                      </span>
                    </TableCell>
                    <TableCell>{dateFormatter.format(new Date(b.createdAt))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-h-full max-w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -right-4 -top-4 rounded-full bg-background p-1 text-foreground shadow-md hover:bg-muted"
            >
              ✕
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage}
              alt="Complaint attached photo"
              className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}
