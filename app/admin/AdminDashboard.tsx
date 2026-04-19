"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type AdminView = "complaints" | "events" | "music" | "users";
type ComplaintScope = "all" | "mine";

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
  departments: string[];
  status: string;
  memberResponse?: string | null;
};

type MusicRequestItem = {
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
  adminResponse?: string | null;
  alternativeDate?: string | null;
  alternativeTime?: string | null;
  alternativeVenue?: string | null;
  alternativeSoundItems?: any;
  alternativeLighting?: string[];
  alternativeNotes?: string | null;
  user?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  createdAt: string;
};

type UserItem = {
  id: string;
  name?: string | null;
  email: string;
  room?: string | null;
  phone?: string | null;
  role: string;
};

const statusOptions = ["ALL", "Not Started", "In Progress", "Finished", "Invalid Request"];
const priorityOptions = ["ALL", "Low", "Medium", "High"];

export default function AdminDashboard({
  complaints,
  events,
  musicRequests,
  users,
  currentUser,
}: {
  complaints: ComplaintItem[];
  events: EventItem[];
  musicRequests: MusicRequestItem[];
  users: UserItem[];
  currentUser: { id: string };
}) {
  const [view, setView] = useState<AdminView>("complaints");
  const [scope, setScope] = useState<ComplaintScope>("all");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [searchText, setSearchText] = useState("");
  const [deletingComplaintId, setDeletingComplaintId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [updatingRoleUserId, setUpdatingRoleUserId] = useState<string | null>(null);
  const [deletingMusicId, setDeletingMusicId] = useState<string | null>(null);
  const [updatingMusicId, setUpdatingMusicId] = useState<string | null>(null);
  
  // Local state for optimistic updates
  const [localComplaints, setLocalComplaints] = useState(complaints);
  const [localMusicRequests, setLocalMusicRequests] = useState(musicRequests);
  const [localUsers, setLocalUsers] = useState(users);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<MusicRequestItem | null>(null);
  const [musicAction, setMusicAction] = useState<'accept' | 'reject' | 'alternative'>('accept');
  const [adminResponse, setAdminResponse] = useState('');
  const [alternatives, setAlternatives] = useState<{
    date: string;
    time: string;
    venue: string;
    soundItems: any;
    lighting: string;
    notes: string;
  }>({
    date: '',
    time: '',
    venue: '',
    soundItems: [],
    lighting: '',
    notes: ''
  });

  const router = useRouter();

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

  // Auto-refresh data from Server Component periodically
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 15000); // 15-second "almost live" refresh rate
    return () => clearInterval(interval);
  }, [router]);

  // Sync incoming live props gracefully to the dashboard without overwriting active operations
  useEffect(() => {
    setLocalComplaints(complaints);
  }, [complaints]);

  useEffect(() => {
    setLocalMusicRequests(musicRequests);
  }, [musicRequests]);

  useEffect(() => {
    setLocalUsers(users);
  }, [users]);

  async function updateComplaint(id: string, field: "status" | "priority", value: string) {
    // Optimistic update
    setLocalComplaints(prev => 
      prev.map(c => c.id === id ? { ...c, [field]: value } : c)
    );

    try {
      await fetch("/api/complaints/update", {
        method: "POST",
        body: JSON.stringify({
          id,
          [field]: value,
        }),
      });
    } catch (error) {
      console.error("Failed to update complaint:", error);
      // Revert on error
      setLocalComplaints(prev => 
        prev.map(c => c.id === id ? { ...c, [field]: c[field] } : c)
      );
    }
  }

  async function deleteComplaint(id: string) {
    setDeletingComplaintId(id);
    
    // Optimistic update
    setLocalComplaints(prev => prev.filter(c => c.id !== id));

    try {
      await fetch("/api/admin/complaints/delete", {
        method: "POST",
        body: JSON.stringify({ id }),
      });
    } catch (error) {
      console.error("Failed to delete complaint:", error);
      // Revert on error - would need to refetch from server
      window.location.reload();
    }
  }

  async function deleteUser(id: string) {
    setDeletingUserId(id);
    
    // Optimistic update
    setLocalUsers(prev => prev.filter(u => u.id !== id));

    try {
      await fetch("/api/admin/users/delete", {
        method: "POST",
        body: JSON.stringify({ id }),
      });
    } catch (error) {
      console.error("Failed to delete user:", error);
      // Revert on error - would need to refetch from server
      window.location.reload();
    }
  }

  async function updateUserRole(id: string, role: "user" | "member") {
    setUpdatingRoleUserId(id);
    
    // Optimistic update
    setLocalUsers(prev => 
      prev.map(u => u.id === id ? { ...u, role } : u)
    );

    try {
      await fetch("/api/admin/users/role", {
        method: "POST",
        body: JSON.stringify({ id, role }),
      });
    } catch (error) {
      console.error("Failed to update user role:", error);
      // Revert on error
      setLocalUsers(prev => 
        prev.map(u => u.id === id ? { ...u, role: u.role === "member" ? "user" : "member" } : u)
      );
    }
  }

  async function deleteMusicRequest(id: string) {
    setDeletingMusicId(id);
    
    // Optimistic update
    setLocalMusicRequests(prev => prev.filter(m => m.id !== id));

    try {
      await fetch("/api/admin/music-requests", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
    } catch (error) {
      console.error("Failed to delete music request:", error);
      // Revert on error - would need to refetch from server
      window.location.reload();
    }
  }

  async function updateMusicRequest(id: string, status: string, response?: string, alt?: any) {
    setUpdatingMusicId(id);
    
    // Optimistic update
    setLocalMusicRequests(prev => 
      prev.map(m => m.id === id ? { 
        ...m, 
        status, 
        adminResponse: response,
        ...(alt && {
          alternativeDate: alt.date,
          alternativeTime: alt.time,
          alternativeVenue: alt.venue,
          alternativeNotes: alt.notes,
        })
      } : m)
    );

    try {
      await fetch("/api/admin/music-requests", {
        method: "PUT",
        body: JSON.stringify({ 
          id, 
          status, 
          adminResponse: response,
          alternatives: alt 
        }),
      });
      setUpdatingMusicId(null);
    } catch (error) {
      console.error("Failed to update music request:", error);
      // Revert on error - would need to refetch from server
      window.location.reload();
    }
  }

  function openMusicModal(music: MusicRequestItem, action: 'accept' | 'reject' | 'alternative') {
    setSelectedMusic(music);
    setMusicAction(action);
    setAdminResponse('');
    setAlternatives({
      date: '',
      time: '',
      venue: '',
      soundItems: action === 'alternative' && Array.isArray(music.soundItems) ? JSON.parse(JSON.stringify(music.soundItems)) : [],
      lighting: action === 'alternative' && Array.isArray(music.lighting) ? music.lighting.join('\n') : '',
      notes: ''
    });
    setShowMusicModal(true);
  }

  function closeMusicModal() {
    setShowMusicModal(false);
    setSelectedMusic(null);
    setAdminResponse('');
    setAlternatives({
      date: '',
      time: '',
      venue: '',
      soundItems: [],
      lighting: '',
      notes: ''
    });
  }

  function getUserName(music: MusicRequestItem) {
    if (music.user) {
      return music.user.name || music.user.email || 'Unknown User';
    }
    const user = users.find(u => u.email === music.organizer);
    return user?.name || music.organizer || 'Unknown User';
  }

  function handleMusicSubmit() {
    if (!selectedMusic) return;

    let status = 'Pending';
    let response = adminResponse;

    let finalAlternatives = undefined;

    if (musicAction === 'accept') {
      status = 'Accepted';
      response = 'Your music request has been accepted! We will provide the requested sound and lighting support.';
    } else if (musicAction === 'reject') {
      status = 'Rejected';
      response = adminResponse || 'Unfortunately, we cannot accommodate your request at this time.';
    } else if (musicAction === 'alternative') {
      status = 'Alternative Offered';
      response = adminResponse || 'We can offer an alternative arrangement as detailed below.';
      
      const originalSoundStr = JSON.stringify(selectedMusic.soundItems || []);
      const newSoundStr = JSON.stringify(alternatives.soundItems || []);
      
      const originalLightStr = JSON.stringify(selectedMusic.lighting || []);
      const newLightArr = typeof alternatives.lighting === 'string' && alternatives.lighting.trim() ? [alternatives.lighting.trim()] : [];
      const newLightStr = JSON.stringify(newLightArr);
      
      finalAlternatives = {
        ...alternatives,
        soundItems: originalSoundStr === newSoundStr ? null : alternatives.soundItems,
        lighting: originalLightStr === newLightStr ? null : newLightArr
      };
    }

    updateMusicRequest(selectedMusic.id, status, response, finalAlternatives);
    closeMusicModal();
  }

  const scopedComplaints = useMemo(
    () => (scope === "mine" ? localComplaints.filter((c) => c.userId === currentUser.id) : localComplaints),
    [scope, localComplaints, currentUser.id]
  );

  const filteredComplaints = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return scopedComplaints.filter((c) => {
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
  }, [scopedComplaints, searchText, statusFilter, priorityFilter]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-foreground">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage complaints, event requests, and users.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {[
          { key: "complaints", label: `Complaints (${localComplaints.length})` },
          { key: "events", label: `Events (${events.length})` },
          { key: "music", label: `Music Events (${localMusicRequests.length})` },
          { key: "users", label: `Users (${localUsers.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key as AdminView)}
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

      {view === "complaints" && (
        <section className="mt-6 rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setScope("all")}
              className={cn(
                "rounded-md border px-3 py-1 text-xs",
                scope === "all" ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-accent"
              )}
            >
              All Complaints
            </button>
            <button
              onClick={() => setScope("mine")}
              className={cn(
                "rounded-md border px-3 py-1 text-xs",
                scope === "mine" ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-accent"
              )}
            >
              My Complaints
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search complaints"
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

          <div className="mt-4 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-3 py-2">Place</th>
                  <th className="px-3 py-2">Issue</th>
                  <th className="px-3 py-2">Description</th>
                  <th className="px-3 py-2">Photo</th>
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Accepted By (Live)</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Priority</th>
                  <th className="px-3 py-2">Updated By</th>
                  <th className="px-3 py-2">Delete</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((c) => (
                  <tr key={c.id} className="border-t border-border">
                    <td className="px-3 py-2">{c.place}</td>
                    <td className="px-3 py-2 align-top">
                      <div className="font-medium">{c.issueType}</div>
                      {c.issueDetail && <div className="text-sm text-muted-foreground">{c.issueDetail}</div>}
                    </td>
                    <td className="px-3 py-2 align-top whitespace-pre-wrap max-w-xs">{c.description || "—"}</td>
                    <td className="px-3 py-2 align-top">
                      {c.photoUrl ? (
                        <a href={c.photoUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                          View
                        </a>
                      ) : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <ContactReveal label={c.user?.name || c.user?.email || "Unknown"} email={c.user?.email} phone={c.user?.phone} />
                    </td>
                    <td className="px-3 py-2">
                      {c.acceptedMembers.length === 0 ? (
                        <span className="text-xs text-muted-foreground">0/2 accepted</span>
                      ) : (
                        <div className="space-y-1">
                          {c.acceptedMembers.map((member) => (
                            <ContactReveal
                              key={member.id}
                              label={member.name || member.email || "Member"}
                              email={member.email}
                              phone={member.phone}
                            />
                          ))}
                          <div className="text-xs text-muted-foreground">{c.acceptanceCount}/2 accepted</div>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">{dateFormatter.format(new Date(c.createdAt))}</td>
                    <td className="px-3 py-2">
                      <select
                        value={c.status}
                        onChange={(e) => updateComplaint(c.id, "status", e.target.value)}
                        aria-label={`Update status for complaint ${c.id}`}
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
                        onClick={() => deleteComplaint(c.id)}
                        disabled={deletingComplaintId === c.id}
                        className="rounded-md border border-destructive/40 px-2 py-1 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-60"
                      >
                        {deletingComplaintId === c.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {view === "events" && (
        <section className="mt-6 rounded-xl border border-border bg-card p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-card-foreground">Event Requests ({events.length})</h2>
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
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-t border-border">
                    <td className="px-3 py-2">{event.eventName}</td>
                    <td className="px-3 py-2">{event.organizerName}</td>
                    <td className="px-3 py-2">{event.eventDate}</td>
                    <td className="px-3 py-2">{event.departments.join(", ")}</td>
                    <td className="px-3 py-2">{event.status}</td>
                    <td className="px-3 py-2">{event.memberResponse || "No response yet"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {view === "music" && (
        <section className="mt-6 rounded-xl border border-border bg-card p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-card-foreground">Music Event Requests ({musicRequests.length})</h2>
          <div className="mt-4 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-3 py-2">Event</th>
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Organizer</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Time</th>
                  <th className="px-3 py-2">Venue</th>
                  <th className="px-3 py-2">Sound Items</th>
                  <th className="px-3 py-2">Lighting</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {localMusicRequests.map((music) => (
                  <tr key={music.id} className="border-t border-border">
                    <td className="px-3 py-2 font-medium">{music.eventName}</td>
                    <td className="px-3 py-2">
                      <ContactReveal
                        label={getUserName(music)}
                        email={music.user?.email || music.organizer}
                        phone={music.user?.phone}
                      />
                    </td>
                    <td className="px-3 py-2">{music.organizer}</td>
                    <td className="px-3 py-2">
                      <div className={music.alternativeDate ? "line-through text-muted-foreground opacity-70 text-xs" : ""}>
                        {music.eventDate}
                      </div>
                      {music.alternativeDate && (
                        <div className="text-yellow-700 font-medium mt-1 text-xs bg-yellow-50 border border-yellow-200 px-1.5 py-0.5 rounded inline-block">
                          Alt: {music.alternativeDate}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className={music.alternativeTime ? "line-through text-muted-foreground opacity-70 text-xs" : ""}>
                        {music.eventTime || "Not specified"}
                      </div>
                      {music.alternativeTime && (
                        <div className="text-yellow-700 font-medium mt-1 text-xs bg-yellow-50 border border-yellow-200 px-1.5 py-0.5 rounded inline-block">
                          Alt: {music.alternativeTime}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className={music.alternativeVenue ? "line-through text-muted-foreground opacity-70 text-xs" : ""}>
                        {music.venue}
                      </div>
                      {music.alternativeVenue && (
                        <div className="text-yellow-700 font-medium mt-1 text-xs bg-yellow-50 border border-yellow-200 px-1.5 py-0.5 rounded inline-block">
                          Alt: {music.alternativeVenue}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className={`max-w-xs ${music.alternativeSoundItems && (music.alternativeSoundItems as any[]).length > 0 ? "line-through text-muted-foreground opacity-70 text-xs" : ""}`}>
                        {Array.isArray(music.soundItems) && music.soundItems.length > 0 ? (
                          <ul className="text-[10px] leading-tight">
                            {(music.soundItems as any[]).map((item: any, index: number) => (
                              <li key={index}>
                                {item.item} ({item.quantity})
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-muted-foreground text-xs">No sound items</span>
                        )}
                      </div>
                      {Array.isArray(music.alternativeSoundItems) && music.alternativeSoundItems.length > 0 && (
                        <div className="mt-1 flex flex-col gap-0.5">
                          <span className="text-[10px] font-bold text-yellow-700">Alt:</span>
                          {(music.alternativeSoundItems as any[]).map((item: any, i: number) => (
                            <span key={i} className="text-[10px] bg-yellow-100 text-yellow-800 border border-yellow-200 px-1 py-0 rounded max-w-max">
                              {item.item} ({item.quantity})
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className={music.alternativeLighting && music.alternativeLighting.length > 0 ? "line-through text-muted-foreground opacity-70 text-xs" : ""}>
                        {music.needsLight ? (
                          <div>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Yes</span>
                            {music.lighting.length > 0 && (
                              <div className="text-[10px] mt-1 leading-tight">
                                {music.lighting.join(", ")}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] bg-gray-100 text-gray-800 px-2 py-0.5 rounded">No</span>
                        )}
                      </div>
                      {Array.isArray(music.alternativeLighting) && music.alternativeLighting.length > 0 && (
                        <div className="mt-1 flex flex-col gap-0.5">
                          <span className="text-[10px] font-bold text-yellow-700">Alt:</span>
                          {music.alternativeLighting.map((light: string, i: number) => (
                            <span key={i} className="text-[10px] bg-yellow-100 text-yellow-800 border border-yellow-200 px-1 py-0 rounded max-w-max">
                              {light}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        music.status === 'Accepted' || music.status === 'Alternative Accepted' ? 'bg-green-100 text-green-800' :
                        music.status === 'Rejected' || music.status === 'Alternative Rejected' ? 'bg-red-100 text-red-800' :
                        music.status === 'Alternative Offered' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {music.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openMusicModal(music, 'accept')}
                          disabled={updatingMusicId === music.id}
                          className="rounded-md border border-green-600 px-2 py-1 text-xs text-green-600 hover:bg-green-50 disabled:opacity-60"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => openMusicModal(music, 'reject')}
                          disabled={updatingMusicId === music.id}
                          className="rounded-md border border-red-600 px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-60"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => openMusicModal(music, 'alternative')}
                          disabled={updatingMusicId === music.id}
                          className="rounded-md border border-yellow-600 px-2 py-1 text-xs text-yellow-600 hover:bg-yellow-50 disabled:opacity-60"
                        >
                          Alternative
                        </button>
                        <button
                          onClick={() => deleteMusicRequest(music.id)}
                          disabled={deletingMusicId === music.id}
                          className="rounded-md border border-destructive/40 px-2 py-1 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-60"
                        >
                          {deletingMusicId === music.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {view === "users" && (
        <section className="mt-6 rounded-xl border border-border bg-card p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-card-foreground">Users ({users.length})</h2>
          <div className="mt-4 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Room</th>
                  <th className="px-3 py-2">Phone</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">Role Action</th>
                  <th className="px-3 py-2">Delete</th>
                </tr>
              </thead>
              <tbody>
                {localUsers.map((user) => (
                  <tr key={user.id} className="border-t border-border">
                    <td className="px-3 py-2">{user.name || "—"}</td>
                    <td className="px-3 py-2">{user.email}</td>
                    <td className="px-3 py-2">{user.room || "—"}</td>
                    <td className="px-3 py-2">{user.phone || "—"}</td>
                    <td className="px-3 py-2 capitalize">{user.role}</td>
                    <td className="px-3 py-2">
                      {user.role === "admin" ? (
                        <span className="text-xs text-muted-foreground">Protected</span>
                      ) : (
                        <button
                          onClick={() => updateUserRole(user.id, user.role === "member" ? "user" : "member")}
                          disabled={updatingRoleUserId === user.id || user.id === currentUser.id}
                          className="rounded-md border border-border px-2 py-1 text-xs text-foreground hover:bg-accent disabled:opacity-60"
                        >
                          {updatingRoleUserId === user.id
                            ? "Updating..."
                            : user.id === currentUser.id
                            ? "Protected"
                            : user.role === "member"
                            ? "Make User"
                            : "Make Member"}
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => deleteUser(user.id)}
                        disabled={deletingUserId === user.id || user.id === currentUser.id}
                        className="rounded-md border border-destructive/40 px-2 py-1 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-60"
                      >
                        {deletingUserId === user.id ? "Deleting..." : user.id === currentUser.id ? "Protected" : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Music Request Management Modal */}
      {showMusicModal && selectedMusic && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {musicAction === 'accept' ? 'Accept Request' : 
               musicAction === 'reject' ? 'Reject Request' : 
               'Offer Alternative'}
            </h3>
            
            <div className="mb-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">Original Request:</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Event:</strong> {selectedMusic.eventName}</p>
                <p><strong>Organizer:</strong> {selectedMusic.organizer}</p>
                <p><strong>Date:</strong> {selectedMusic.eventDate}</p>
                <p><strong>Time:</strong> {selectedMusic.eventTime || 'Not specified'}</p>
                <p><strong>Venue:</strong> {selectedMusic.venue}</p>
                <p><strong>Lighting:</strong> {selectedMusic.needsLight ? 'Yes' : 'No'}</p>
              </div>
            </div>

            {musicAction === 'alternative' && (
              <div className="space-y-4 mb-4">
                <h4 className="font-medium text-foreground">Alternative Arrangement:</h4>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Alternative Date</label>
                  <input
                    type="date"
                    value={alternatives.date}
                    onChange={(e) => setAlternatives({...alternatives, date: e.target.value})}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    title="Alternative Date"
                    placeholder="Select alternative date"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Alternative Time</label>
                  <input
                    type="time"
                    value={alternatives.time}
                    onChange={(e) => setAlternatives({...alternatives, time: e.target.value})}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    title="Alternative Time"
                    placeholder="Select alternative time"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Alternative Venue</label>
                  <input
                    type="text"
                    value={alternatives.venue}
                    onChange={(e) => setAlternatives({...alternatives, venue: e.target.value})}
                    placeholder="e.g. Different auditorium, Studio room"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-foreground">Alternative Sound Items</label>
                    <button
                      type="button"
                      onClick={() => setAlternatives({...alternatives, soundItems: [...(alternatives.soundItems as any[] || []), { item: "", quantity: "" }]})}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      + Add Item
                    </button>
                  </div>
                  <div className="space-y-2">
                    {Array.isArray(alternatives.soundItems) && alternatives.soundItems.map((snd: any, index: number) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Item name"
                          value={snd.item}
                          onChange={(e) => {
                            const newArr = [...(alternatives.soundItems as any[])];
                            newArr[index].item = e.target.value;
                            setAlternatives({...alternatives, soundItems: newArr});
                          }}
                          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Qty"
                          className="w-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={snd.quantity}
                          onChange={(e) => {
                            const newArr = [...(alternatives.soundItems as any[])];
                            newArr[index].quantity = e.target.value;
                            setAlternatives({...alternatives, soundItems: newArr});
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newArr = [...(alternatives.soundItems as any[])];
                            newArr.splice(index, 1);
                            setAlternatives({...alternatives, soundItems: newArr});
                          }}
                          className="text-red-500 hover:text-red-700 px-2 py-1"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {(!Array.isArray(alternatives.soundItems) || alternatives.soundItems.length === 0) && (
                      <div className="text-xs text-muted-foreground italic py-1">No sound items specified.</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Alternative Lighting</label>
                    <textarea
                      value={alternatives.lighting as string}
                      onChange={(e) => setAlternatives({...alternatives, lighting: e.target.value})}
                      placeholder="Describe alternative lighting requirements..."
                      rows={3}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Alternative Notes</label>
                  <textarea
                    value={alternatives.notes}
                    onChange={(e) => setAlternatives({...alternatives, notes: e.target.value})}
                    placeholder="Additional information about the alternative arrangement"
                    rows={2}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-1">Response Message</label>
              <textarea
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder={
                  musicAction === 'accept' ? 'Your music request has been accepted! We will provide the requested sound and lighting support.' :
                  musicAction === 'reject' ? 'Unfortunately, we cannot accommodate your request at this time.' :
                  'We can offer an alternative arrangement as detailed below.'
                }
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={closeMusicModal}
                className="px-4 py-2 text-sm border border-border rounded-md hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleMusicSubmit}
                disabled={updatingMusicId === selectedMusic.id}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-60"
              >
                {updatingMusicId === selectedMusic.id ? 'Processing...' : 
                 musicAction === 'accept' ? 'Accept' : 
                 musicAction === 'reject' ? 'Reject' : 
                 'Offer Alternative'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
