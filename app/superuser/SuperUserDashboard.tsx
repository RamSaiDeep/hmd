"use client";
import { formatTimeTo12Hour } from "@/lib/time";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ASSIGNABLE_ROLES,
  canAssignRole,
  canDeleteUser,
  getRoleLabel,
  parseUserRole,
  type UserRole,
} from "@/lib/roles";
import SettingsTab from "@/components/SettingsTab";
import AssignModal from "@/components/AssignModal";
import ContactReveal from "@/components/ContactReveal";

type UserItem = {
  id: string;
  name?: string | null;
  email: string;
  room?: string | null;
  phone?: string | null;
  role: string;
};

type ComplaintItem = {
  id: string;
  place: string;
  issueType: string;
  issueDetail?: string | null;
  description?: string | null;
  photoUrl?: string | null;
  status: string;
  priority: string;
  createdAt: string;
  updatedBy?: string | null;
  userId: string;
  user?: { name?: string | null; email?: string | null; phone?: string | null } | null;
  acceptanceCount: number;
  acceptedMembers: Array<{ id: string; name?: string | null; email?: string | null; phone?: string | null }>;
};

type MusicItem = {
  id: string;
  eventName: string;
  organizer: string;
  eventDate: string;
  eventTime?: string | null;
  venue: string;
  status: string;
  notes?: string | null;
  user?: { name?: string | null; email?: string | null; phone?: string | null } | null;
  createdAt: string;
  acceptanceCount: number;
  acceptedMembers: Array<{ id: string; name?: string | null; email?: string | null; phone?: string | null }>;
};

type EventItem = {
  id: string;
  eventName: string;
  organizerName: string;
  eventDate: string;
  eventTime?: string | null;
  departments: string[];
  status: string;
  memberResponse?: string | null;
  createdAt: string;
  acceptanceCount: number;
  acceptedMembers: Array<{ id: string; name?: string | null; email?: string | null; phone?: string | null }>;
};


type StudioItem = {
  id: string;
  day: string;
  slot: string;
  purpose: string;
  description: string;
  bookingName?: string | null;
  recordingTime?: string | null;
  artistName?: string | null;
  vocalOrInstrument?: string | null;
  status: string;
  user?: { name?: string | null; email?: string | null; phone?: string | null } | null;
  createdAt: string;
  acceptanceCount: number;
  acceptedMembers: Array<{ id: string; name?: string | null; email?: string | null; phone?: string | null }>;
};

type SuperView = "users" | "complaints" | "music" | "events" | "studio" | "settings";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});


export default function SuperUserDashboard({
  users,
  complaints = [],
  musicRequests = [],
  eventRequests = [],
  studioBookings = [],
  currentUser,
}: {
  users: UserItem[];
  complaints?: ComplaintItem[];
  musicRequests?: MusicItem[];
  eventRequests?: EventItem[];
  studioBookings?: StudioItem[];
  currentUser: { id: string; role: string };
}) {
  const [view, setView] = useState<SuperView>("users");
  const [localUsers, setLocalUsers] = useState(users);
  const [updatingRoleUserId, setUpdatingRoleUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<{ id: string; type: "complaint" | "event" | "music" | "studio" } | null>(null);
  const [error, setError] = useState("");

  async function updateUserRole(id: string, role: UserRole) {
    setError("");
    setUpdatingRoleUserId(id);
    const previous = localUsers;
    setLocalUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    try {
      const response = await fetch("/api/admin/users/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to update role");
      }
    } catch (updateError) {
      setLocalUsers(previous);
      setError(updateError instanceof Error ? updateError.message : "Failed to update role");
    } finally {
      setUpdatingRoleUserId(null);
    }
  }

  async function deleteUser(id: string) {
    setDeletingUserId(id);
    setLocalUsers((prev) => prev.filter((u) => u.id !== id));
    try {
      await fetch("/api/admin/users/delete", {
        method: "POST",
        body: JSON.stringify({ id }),
      });
    } catch {
      window.location.reload();
    }
  }

  const tabs: { key: SuperView; label: string }[] = [
    { key: "users", label: `Users (${localUsers.length})` },
    { key: "complaints", label: `Complaints (${complaints.length})` },
    { key: "music", label: `Music (${musicRequests.length})` },
    { key: "events", label: `Events (${eventRequests.length})` },
    { key: "studio", label: `SRDRS (${studioBookings.length})` },
    { key: "settings", label: "Settings" },
  ];

  function openAssign(id: string, type: "complaint" | "event" | "music" | "studio") {
    setAssignTarget({ id, type });
    setAssignModalOpen(true);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Super User Panel</h1>
        <p className="mt-1 text-muted-foreground">
          Manage users, requests, assignments, and system settings.
        </p>
      </div>

      {/* Tab Bar */}
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={cn(
              "rounded-lg border px-3 py-2 text-sm font-medium",
              view === tab.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-card-foreground hover:bg-accent"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && view === "users" && (
        <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* ── USERS ── */}
      {view === "users" && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Room</th>
                <th className="px-3 py-2">Current Role</th>
                <th className="px-3 py-2">Set Role</th>
                <th className="px-3 py-2">Delete</th>
              </tr>
            </thead>
            <tbody>
              {localUsers.map((user) => {
                const isSelf = user.id === currentUser.id;
                const isProtected = parseUserRole(user.role) === "superuser" || isSelf;
                return (
                  <tr key={user.id} className="border-t border-border">
                    <td className="px-3 py-2">{user.name || "—"}</td>
                    <td className="px-3 py-2">{user.email}</td>
                    <td className="px-3 py-2">{user.room || "—"}</td>
                    <td className="px-3 py-2">{getRoleLabel(user.role)}</td>
                    <td className="px-3 py-2">
                      {isProtected ? (
                        <span className="text-xs text-muted-foreground">Protected</span>
                      ) : (
                        <select
                          value={parseUserRole(user.role)}
                          disabled={updatingRoleUserId === user.id}
                          onChange={(e) => updateUserRole(user.id, e.target.value as UserRole)}
                          className="rounded-md border border-border bg-background px-2 py-1 text-xs disabled:opacity-60"
                        >
                          {ASSIGNABLE_ROLES.filter((role) =>
                            canAssignRole("superuser", user.role, role)
                          ).map((role) => (
                            <option key={role} value={role}>
                              {getRoleLabel(role)}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => deleteUser(user.id)}
                        disabled={
                          deletingUserId === user.id ||
                          !canDeleteUser(currentUser.role, user.role, currentUser.id, user.id)
                        }
                        className="rounded-md border border-destructive/40 px-2 py-1 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-60"
                      >
                        {deletingUserId === user.id
                          ? "Deleting..."
                          : !canDeleteUser(currentUser.role, user.role, currentUser.id, user.id)
                          ? "Protected"
                          : "Delete"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── COMPLAINTS ── */}
      {view === "complaints" && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-3 py-2">Place</th>
                <th className="px-3 py-2">Issue</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">Photo</th>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Priority</th>
                <th className="px-3 py-2">Assigned ({complaints.reduce((s, c) => s + c.acceptanceCount, 0)})</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0 ? (
                <tr><td colSpan={10} className="px-3 py-4 text-center text-muted-foreground">No complaints found.</td></tr>
              ) : (
                complaints.map((c) => (
                  <tr key={c.id} className="border-t border-border">
                    <td className="px-3 py-2">{c.place}</td>
                    <td className="px-3 py-2 align-top">
                      <div className="font-medium">{c.issueType}</div>
                      {c.issueDetail && <div className="text-xs text-muted-foreground">{c.issueDetail}</div>}
                    </td>
                    <td className="px-3 py-2 align-top whitespace-pre-wrap max-w-xs">{c.description || "—"}</td>
                    <td className="px-3 py-2 align-top">
                      {c.photoUrl ? (
                        <button onClick={() => setSelectedImage(c.photoUrl!)} className="text-blue-500 hover:underline">View</button>
                      ) : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <ContactReveal
                        label={c.user?.name || c.user?.email || "—"}
                        email={c.user?.email}
                        phone={c.user?.phone}
                      />
                    </td>
                    <td className="px-3 py-2">{dateFormatter.format(new Date(c.createdAt))}</td>
                    <td className="px-3 py-2">{c.status}</td>
                    <td className="px-3 py-2">{c.priority}</td>
                    <td className="px-3 py-2">
                      {c.acceptedMembers.length > 0 ? (
                        <div className="space-y-1">
                          {c.acceptedMembers.map((mem) => (
                            <ContactReveal
                              key={mem.id}
                              label={mem.name || mem.email || "Member"}
                              email={mem.email}
                              phone={mem.phone}
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">None yet</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <button onClick={() => openAssign(c.id, "complaint")} className="rounded-md border border-primary/40 px-2 py-1 text-xs text-primary hover:bg-primary/10">
                        Assign
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── MUSIC REQUESTS ── */}
      {view === "music" && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-3 py-2">Event</th>
                <th className="px-3 py-2">Organizer</th>
                <th className="px-3 py-2">Requested By</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Venue</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Assigned ({musicRequests.reduce((s, m) => s + m.acceptanceCount, 0)})</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {musicRequests.length === 0 ? (
                <tr><td colSpan={8} className="px-3 py-4 text-center text-muted-foreground">No music requests found.</td></tr>
              ) : (
                musicRequests.map((m) => (
                  <tr key={m.id} className="border-t border-border">
                    <td className="px-3 py-2 font-medium">{m.eventName}</td>
                    <td className="px-3 py-2">{m.organizer}</td>
                    <td className="px-3 py-2">
                      <ContactReveal
                        label={m.user?.name || m.user?.email || "—"}
                        email={m.user?.email}
                        phone={m.user?.phone}
                      />
                    </td>
                    <td className="px-3 py-2">
                      {m.eventDate} {m.eventTime && `at ${formatTimeTo12Hour(m.eventTime)}`}
                    </td>

                    <td className="px-3 py-2">{m.venue}</td>
                    <td className="px-3 py-2">{m.status}</td>
                    <td className="px-3 py-2">
                      {m.acceptedMembers.length > 0 ? (
                        <div className="space-y-1">
                          {m.acceptedMembers.map((mem) => (
                            <ContactReveal
                              key={mem.id}
                              label={mem.name || mem.email || "Member"}
                              email={mem.email}
                              phone={mem.phone}
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">None yet</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <button onClick={() => openAssign(m.id, "music")} className="rounded-md border border-primary/40 px-2 py-1 text-xs text-primary hover:bg-primary/10">
                        Assign
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── EVENT REQUESTS ── */}
      {view === "events" && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-3 py-2">Event</th>
                <th className="px-3 py-2">Organizer</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Departments</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Response</th>
                <th className="px-3 py-2">Assigned ({eventRequests.reduce((s, e) => s + e.acceptanceCount, 0)})</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {eventRequests.length === 0 ? (
                <tr><td colSpan={8} className="px-3 py-4 text-center text-muted-foreground">No event requests found.</td></tr>
              ) : (
                eventRequests.map((e) => (
                  <tr key={e.id} className="border-t border-border">
                    <td className="px-3 py-2 font-medium">{e.eventName}</td>
                    <td className="px-3 py-2">{e.organizerName}</td>
                    <td className="px-3 py-2">
                      {e.eventDate} {e.eventTime && `at ${formatTimeTo12Hour(e.eventTime)}`}
                    </td>

                    <td className="px-3 py-2">{e.departments.join(", ")}</td>
                    <td className="px-3 py-2">{e.status}</td>
                    <td className="px-3 py-2">{e.memberResponse || "—"}</td>
                    <td className="px-3 py-2">
                      {e.acceptedMembers.length > 0 ? (
                        <div className="space-y-1">
                          {e.acceptedMembers.map((mem) => (
                            <ContactReveal
                              key={mem.id}
                              label={mem.name || mem.email || "Member"}
                              email={mem.email}
                              phone={mem.phone}
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">None yet</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <button onClick={() => openAssign(e.id, "event")} className="rounded-md border border-primary/40 px-2 py-1 text-xs text-primary hover:bg-primary/10">
                        Assign
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── SRDRS / STUDIO BOOKINGS ── */}
      {view === "studio" && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-3 py-2">Day</th>
                <th className="px-3 py-2">Slot</th>
                <th className="px-3 py-2">Booking Name</th>
                <th className="px-3 py-2">Recording Time</th>
                <th className="px-3 py-2">Artist Name</th>
                <th className="px-3 py-2">Vocal/Instrument</th>
                <th className="px-3 py-2">Purpose</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">Requested By</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Assigned ({studioBookings.reduce((s, b) => s + b.acceptanceCount, 0)})</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {studioBookings.length === 0 ? (
                <tr><td colSpan={13} className="px-3 py-4 text-center text-muted-foreground">No studio bookings found.</td></tr>
              ) : (
                studioBookings.map((s) => (
                  <tr key={s.id} className="border-t border-border">
                    <td className="px-3 py-2 font-medium">{s.day}</td>
                    <td className="px-3 py-2">{formatTimeTo12Hour(s.slot)}</td>
                    <td className="px-3 py-2">{s.bookingName || "—"}</td>
                    <td className="px-3 py-2">{formatTimeTo12Hour(s.recordingTime)}</td>

                    <td className="px-3 py-2">{s.artistName || "—"}</td>
                    <td className="px-3 py-2">{s.vocalOrInstrument || "—"}</td>
                    <td className="px-3 py-2">{s.purpose}</td>
                    <td className="px-3 py-2 max-w-xs truncate" title={s.description}>{s.description}</td>
                    <td className="px-3 py-2">
                      <ContactReveal
                        label={s.user?.name || s.user?.email || "—"}
                        email={s.user?.email}
                        phone={s.user?.phone}
                      />
                    </td>
                    <td className="px-3 py-2">{dateFormatter.format(new Date(s.createdAt))}</td>
                    <td className="px-3 py-2">{s.status}</td>
                    <td className="px-3 py-2">
                      {s.acceptedMembers.length > 0 ? (
                        <div className="space-y-1">
                          {s.acceptedMembers.map((mem) => (
                            <ContactReveal
                              key={mem.id}
                              label={mem.name || mem.email || "Member"}
                              email={mem.email}
                              phone={mem.phone}
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">None yet</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <button onClick={() => openAssign(s.id, "studio")} className="rounded-md border border-primary/40 px-2 py-1 text-xs text-primary hover:bg-primary/10">
                        Assign
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── SETTINGS ── */}
      {view === "settings" && <SettingsTab />}

      {/* Assign Modal */}
      {assignTarget && (
        <AssignModal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          requestId={assignTarget.id}
          requestType={assignTarget.type}
          users={localUsers}
          onAssigned={() => window.location.reload()}
        />
      )}

      {/* Image Modal */}
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
