"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type AdminView = "complaints" | "events" | "users";
type ComplaintScope = "all" | "mine";

type ComplaintItem = {
  id: string;
  place: string;
  issueType: string;
  issueDetail?: string | null;
  status: string;
  priority: string;
  createdAt: string;
  updatedBy?: string | null;
  userId: string;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
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
  users,
  currentUser,
}: {
  complaints: ComplaintItem[];
  events: EventItem[];
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

  async function updateComplaint(id: string, field: "status" | "priority", value: string) {
    await fetch("/api/complaints/update", {
      method: "POST",
      body: JSON.stringify({
        id,
        [field]: value,
      }),
    });

    window.location.reload();
  }

  async function deleteComplaint(id: string) {
    setDeletingComplaintId(id);
    await fetch("/api/admin/complaints/delete", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
    window.location.reload();
  }

  async function deleteUser(id: string) {
    setDeletingUserId(id);
    await fetch("/api/admin/users/delete", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
    window.location.reload();
  }

  async function updateUserRole(id: string, role: "user" | "member") {
    setUpdatingRoleUserId(id);
    await fetch("/api/admin/users/role", {
      method: "POST",
      body: JSON.stringify({ id, role }),
    });
    window.location.reload();
  }

  const scopedComplaints = useMemo(
    () => (scope === "mine" ? complaints.filter((c) => c.userId === currentUser.id) : complaints),
    [scope, complaints, currentUser.id]
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
          { key: "complaints", label: `Complaints (${complaints.length})` },
          { key: "events", label: `Events (${events.length})` },
          { key: "users", label: `Users (${users.length})` },
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
                  <th className="px-3 py-2">User</th>
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
                    <td className="px-3 py-2">
                      {c.issueType}
                      {c.issueDetail ? ` — ${c.issueDetail}` : ""}
                    </td>
                    <td className="px-3 py-2">{c.user?.name || c.user?.email}</td>
                    <td className="px-3 py-2">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-3 py-2">
                      <select
                        value={c.status}
                        onChange={(e) => updateComplaint(c.id, "status", e.target.value)}
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
                {users.map((user) => (
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
    </div>
  );
}
