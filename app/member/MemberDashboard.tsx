/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import ContactReveal from "@/components/ContactReveal";
import { formatTimeTo12Hour } from "@/lib/time";

import { Fragment, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type MemberView = "all" | "mine" | "events" | "music" | "studio";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});


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
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  acceptanceCount: number;
  acceptedMembers: Array<{
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  }>;
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

  acceptanceCount: number;
  acceptedMembers: Array<{ id: string; name?: string | null; email?: string | null; phone?: string | null; }>;
};

type MusicItem = {
  id: string;
  eventName: string;
  organizer: string;
  eventDate: string;
  eventTime?: string | null;
  venue: string;
  soundItems: any;
  needsLight: boolean;
  lighting: string[];
  notes?: string | null;
  status: string;
  user?: { name?: string | null; email?: string | null; phone?: string | null; } | null;
  createdAt: string;
  acceptanceCount: number;
  acceptedMembers: Array<{ id: string; name?: string | null; email?: string | null; phone?: string | null; }>;
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
  user?: { name?: string | null; email?: string | null; phone?: string | null; } | null;
  createdAt: string;
  acceptanceCount: number;
  acceptedMembers: Array<{ id: string; name?: string | null; email?: string | null; phone?: string | null; }>;
};

const statusOptions = ["ALL", "Not Started", "In Progress", "Finished", "Invalid Request"];
const priorityOptions = ["ALL", "Low", "Medium", "High"];

export default function MemberDashboard({
  complaints,
  events,
  musicRequests = [],
  studioBookings = [],
  settings,
  currentUser,
  initialView = "all",
}: {
  complaints: ComplaintItem[];
  events: EventItem[];
  musicRequests?: MusicItem[];
  studioBookings?: StudioItem[];
  settings: Record<string, string>;
  currentUser: { id: string };
  initialView?: MemberView;
}) {
  const compLimit = parseInt(settings.COMPLAINT_ACCEPTANCE_LIMIT || "2", 10);
  const musicLimit = parseInt(settings.MUSIC_ACCEPTANCE_LIMIT || "5", 10);
  const eventLimit = parseInt(settings.EVENT_ACCEPTANCE_LIMIT || "5", 10);
  const studioLimit = parseInt(settings.STUDIO_ACCEPTANCE_LIMIT || "2", 10);
  const [view, setView] = useState<MemberView>(initialView);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [searchText, setSearchText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);


  async function updateComplaint(id: string, field: string, value: string) {
    await fetch("/api/complaints/update", {
      method: "POST",
      body: JSON.stringify({
        id,
        [field]: value,
      }),
    });

    window.location.reload();
  }

  async function acceptRequest(id: string, type: "complaint" | "event" | "music" | "studio") {
    await fetch("/api/accept", {
      method: "POST",
      body: JSON.stringify({
        id,
        type,
      }),
    });

    window.location.reload();
  }

  function saveEventResponse() {
    alert("Event response saved (connect API later)");
    setRespondingId(null);
    setResponseText("");
  }

  const baseComplaints = useMemo(
    () => (view === "mine" ? complaints.filter((c) => c.userId === currentUser.id) : complaints),
    [view, complaints, currentUser.id]
  );

  const visibleComplaints = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return baseComplaints.filter((c) => {
      const statusMatch = statusFilter === "ALL" || c.status === statusFilter;
      const priorityMatch = priorityFilter === "ALL" || c.priority === priorityFilter;
      const textMatch =
        query.length === 0 ||
        c.place.toLowerCase().includes(query) ||
        c.issueType.toLowerCase().includes(query) ||
        (c.issueDetail ?? "").toLowerCase().includes(query) ||
        (c.user?.name ?? c.user?.email ?? "").toLowerCase().includes(query);

      return statusMatch && priorityMatch && textMatch;
    });
  }, [baseComplaints, priorityFilter, searchText, statusFilter]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-foreground">Member Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage all hostel complaints and event requests.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {[
          { key: "all", label: `All Complaints (${complaints.length})` },
          { key: "mine", label: `My Complaints (${complaints.filter((c) => c.userId === currentUser.id).length})` },
          { key: "events", label: `Event Requests (${events.length})` },
          { key: "music", label: `Music Requests (${musicRequests.length})` },
          { key: "studio", label: `SRDRS Bookings (${studioBookings.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key as MemberView)}
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

      {(view === "all" || view === "mine") && (
        <section className="mt-6 rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-card-foreground">
              {view === "all" ? "All Complaints" : "My Complaints"}
            </h2>
            <span className="text-sm text-muted-foreground">{visibleComplaints.length} showing</span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search place / issue / user"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter complaints by status"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status === "ALL" ? "All Statuses" : status}
                </option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              aria-label="Filter complaints by priority"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            >
              {priorityOptions.map((priority) => (
                <option key={priority} value={priority}>
                  {priority === "ALL" ? "All Priorities" : priority}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setSearchText("");
                setStatusFilter("ALL");
                setPriorityFilter("ALL");
              }}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-accent"
            >
              Reset filters
            </button>
          </div>

          {visibleComplaints.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No complaints match this filter.</p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-3 py-2">Place</th>
                    <th className="px-3 py-2">Issue</th>
                    <th className="px-3 py-2">Description</th>
                    <th className="px-3 py-2">Photo</th>
                    <th className="px-3 py-2">User</th>
                    <th className="px-3 py-2">Accepted By</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Priority</th>
                    <th className="px-3 py-2">Updated By</th>
                    <th className="px-3 py-2">Accept</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleComplaints.map((c) => (
                    (() => {
                      const isAssignedMember = c.acceptedMembers.some((member) => member.id === currentUser.id);
                      const canUpdate = c.acceptanceCount >= compLimit && isAssignedMember;
                      return (
                    <tr key={c.id} className="border-t border-border">
                      <td className="px-3 py-2">{c.place}</td>
                      <td className="px-3 py-2 align-top">
                        <div className="font-medium">{c.issueType}</div>
                        {c.issueDetail && <div className="text-sm text-muted-foreground">{c.issueDetail}</div>}
                      </td>
                      <td className="px-3 py-2 align-top whitespace-pre-wrap max-w-xs">{c.description || "—"}</td>
                      <td className="px-3 py-2 align-top">
                        {c.photoUrl ? (
                          <button
                            onClick={() => setSelectedImage(c.photoUrl!)}
                            className="text-blue-500 hover:underline"
                          >
                            View
                          </button>
                        ) : "—"}
                      </td>
                      <td className="px-3 py-2">
                        <ContactReveal label={c.user?.name || c.user?.email || "Unknown"} email={c.user?.email} phone={c.user?.phone} />
                      </td>
                      <td className="px-3 py-2">
                        {c.acceptanceCount >= compLimit && isAssignedMember ? (
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
                          <span className="text-xs text-muted-foreground">{c.acceptanceCount}/{compLimit} accepted</span>
                        )}
                      </td>
                      <td className="px-3 py-2">{dateFormatter.format(new Date(c.createdAt))}</td>
                      <td className="px-3 py-2">
                        <select
                          value={c.status}
                          onChange={(e) => updateComplaint(c.id, "status", e.target.value)}
                          aria-label={`Update status for complaint ${c.id}`}
                          disabled={!canUpdate}
                          className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                        >
                          <option value="Not Started">Not Started</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Finished">Finished</option>
                          <option value="Invalid Request">Invalid Request</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={c.priority}
                          onChange={(e) => updateComplaint(c.id, "priority", e.target.value)}
                          aria-label={`Update priority for complaint ${c.id}`}
                          disabled={!canUpdate}
                          className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">{c.updatedBy || "—"}</td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => acceptRequest(c.id, "complaint")}
                          disabled={c.acceptanceCount >= compLimit || isAssignedMember}
                          className="rounded-md border border-border px-2 py-1 text-xs hover:bg-accent disabled:opacity-50"
                        >
                          {isAssignedMember ? "Accepted" : c.acceptanceCount >= compLimit ? "Locked" : "Accept"}
                        </button>
                      </td>
                    </tr>
                      );
                    })()
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {view === "events" && (
        <section className="mt-6 rounded-xl border border-border bg-card p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-card-foreground">Event Requests ({events.length})</h2>

          {events.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No events found.</p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-3 py-2">Event</th>
                    <th className="px-3 py-2">Organizer</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Departments</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Response</th>
                    <th className="px-3 py-2">Accepted By</th>
                    <th className="px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((e) => (
                    <Fragment key={e.id}>
                      <tr className="border-t border-border">
                        <td className="px-3 py-2">{e.eventName}</td>
                        <td className="px-3 py-2">{e.organizerName}</td>
                        <td className="px-3 py-2">
                          {e.eventDate} {e.eventTime && `at ${formatTimeTo12Hour(e.eventTime)}`}
                        </td>

                        <td className="px-3 py-2">{e.departments.join(", ")}</td>
                        <td className="px-3 py-2">{e.status}</td>
                        <td className="px-3 py-2">{e.memberResponse || "No response yet"}</td>
                        <td className="px-3 py-2">
                          {e.acceptanceCount >= eventLimit ? (
                            <div className="space-y-1">
                              {e.acceptedMembers.map((member) => (
                                <ContactReveal
                                  key={member.id}
                                  label={member.name || member.email || "Member"}
                                  email={member.email}
                                  phone={member.phone}
                                />
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">{e.acceptanceCount}/{eventLimit} accepted</span>
                          )}
                        </td>
                        <td className="px-3 py-2 flex gap-1">
                          <button
                            onClick={() => acceptRequest(e.id, "event")}
                            disabled={e.acceptanceCount >= eventLimit || e.acceptedMembers.some((m) => m.id === currentUser.id)}
                            className="rounded-md border border-border px-2 py-1 text-xs hover:bg-accent disabled:opacity-50"
                          >
                            {e.acceptedMembers.some((m) => m.id === currentUser.id) ? "Accepted" : e.acceptanceCount >= eventLimit ? "Locked" : "Accept"}
                          </button>
                          <button
                            onClick={() => {
                              if (respondingId === e.id) {
                                setRespondingId(null);
                              } else {
                                setRespondingId(e.id);
                                setResponseText(e.memberResponse || "");
                              }
                            }}
                            className="rounded-md border border-border px-2 py-1 text-xs hover:bg-accent"
                          >
                            {respondingId === e.id ? "Cancel" : "Respond"}
                          </button>
                        </td>
                      </tr>

                      {respondingId === e.id && (
                        <tr key={`respond-${e.id}`} className="border-t border-border">
                          <td colSpan={7} className="px-3 py-3">
                            <textarea
                              rows={4}
                              value={responseText}
                              onChange={(event) => setResponseText(event.target.value)}
                              aria-label="Event response"
                              className="w-full rounded-md border border-input bg-background p-2 text-sm text-foreground"
                            />
                            <button
                              onClick={saveEventResponse}
                              className="mt-2 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                            >
                              Send Response
                            </button>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {view === "music" && (
        <section className="mt-6 rounded-xl border border-border bg-card p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-card-foreground">Music Requests ({musicRequests.length})</h2>

          {musicRequests.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No music requests found.</p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-3 py-2">Event</th>
                    <th className="px-3 py-2">User</th>
                    <th className="px-3 py-2">Organizer</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Accepted By</th>
                    <th className="px-3 py-2">Accept</th>
                  </tr>
                </thead>
                <tbody>
                  {musicRequests.map((m) => {
                    const isAssigned = m.acceptedMembers.some((member) => member.id === currentUser.id);
                    return (
                      <tr key={m.id} className="border-t border-border">
                        <td className="px-3 py-2 font-medium">{m.eventName}</td>
                        <td className="px-3 py-2">
                          <ContactReveal
                            label={m.user?.name || m.user?.email || "Unknown"}
                            email={m.user?.email}
                            phone={m.user?.phone}
                          />
                        </td>
                        <td className="px-3 py-2">{m.organizer}</td>
                        <td className="px-3 py-2">
                          {m.eventDate} {m.eventTime && `at ${formatTimeTo12Hour(m.eventTime)}`}
                        </td>

                        <td className="px-3 py-2">{m.status}</td>
                        <td className="px-3 py-2">
                          {m.acceptanceCount >= musicLimit ? (
                            <div className="space-y-1">
                              {m.acceptedMembers.map((member) => (
                                <ContactReveal
                                  key={member.id}
                                  label={member.name || member.email || "Member"}
                                  email={member.email}
                                  phone={member.phone}
                                />
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">{m.acceptanceCount}/{musicLimit} accepted</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => acceptRequest(m.id, "music")}
                            disabled={m.acceptanceCount >= musicLimit || isAssigned}
                            className="rounded-md border border-border px-2 py-1 text-xs hover:bg-accent disabled:opacity-50"
                          >
                            {isAssigned ? "Accepted" : m.acceptanceCount >= musicLimit ? "Locked" : "Accept"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {view === "studio" && (
        <section className="mt-6 rounded-xl border border-border bg-card p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-card-foreground">SRDRS Bookings ({studioBookings.length})</h2>

          {studioBookings.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No bookings found.</p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-3 py-2">Day & Slot</th>
                    <th className="px-3 py-2">Booking Details</th>
                    <th className="px-3 py-2">Purpose</th>
                    <th className="px-3 py-2">Description</th>
                    <th className="px-3 py-2">User</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Accepted By</th>
                    <th className="px-3 py-2">Accept</th>
                  </tr>
                </thead>
                <tbody>
                  {studioBookings.map((s) => {
                    const isAssigned = s.acceptedMembers.some((member) => member.id === currentUser.id);
                    return (
                      <tr key={s.id} className="border-t border-border">
                        <td className="px-3 py-2 font-medium">{s.day} <br/><span className="text-xs text-muted-foreground">{formatTimeTo12Hour(s.slot)}</span></td>
                        <td className="px-3 py-2">
                          <div className="text-xs space-y-0.5">
                            <p><strong>Name:</strong> {s.bookingName || "—"}</p>
                            <p><strong>Time:</strong> {formatTimeTo12Hour(s.recordingTime)}</p>

                            <p><strong>Artist:</strong> {s.artistName || "—"}</p>
                            <p><strong>Vocal/Inst:</strong> {s.vocalOrInstrument || "—"}</p>
                          </div>
                        </td>
                        <td className="px-3 py-2">{s.purpose}</td>
                        <td className="px-3 py-2 max-w-xs truncate" title={s.description}>{s.description}</td>
                        <td className="px-3 py-2">
                          <ContactReveal
                            label={s.user?.name || s.user?.email || "Unknown"}
                            email={s.user?.email}
                            phone={s.user?.phone}
                          />
                        </td>
                        <td className="px-3 py-2">{s.status}</td>
                        <td className="px-3 py-2">
                          {s.acceptanceCount >= studioLimit ? (
                            <div className="space-y-1">
                              {s.acceptedMembers.map((member) => (
                                <ContactReveal
                                  key={member.id}
                                  label={member.name || member.email || "Member"}
                                  email={member.email}
                                  phone={member.phone}
                                />
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">{s.acceptanceCount}/{studioLimit} accepted</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => acceptRequest(s.id, "studio")}
                            disabled={s.acceptanceCount >= studioLimit || isAssigned}
                            className="rounded-md border border-border px-2 py-1 text-xs hover:bg-accent disabled:opacity-50"
                          >
                            {isAssigned ? "Accepted" : s.acceptanceCount >= studioLimit ? "Locked" : "Accept"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

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
