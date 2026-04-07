"use client";

import { Fragment, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type MemberView = "all" | "mine" | "events";

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

const statusOptions = ["ALL", "Not Started", "In Progress", "Finished", "Invalid Request"];
const priorityOptions = ["ALL", "Low", "Medium", "High"];

export default function MemberDashboard({
  complaints,
  events,
  currentUser,
  initialView = "all",
}: {
  complaints: ComplaintItem[];
  events: EventItem[];
  currentUser: { id: string };
  initialView?: MemberView;
}) {
  const [view, setView] = useState<MemberView>(initialView);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [searchText, setSearchText] = useState("");

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
                    <th className="px-3 py-2">User</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Priority</th>
                    <th className="px-3 py-2">Updated By</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleComplaints.map((c) => (
                    <tr key={c.id} className="border-t border-border">
                      <td className="px-3 py-2">{c.place}</td>
                      <td className="px-3 py-2">
                        {c.issueType}
                        {c.issueDetail ? ` — ${c.issueDetail}` : ""}
                      </td>
                      <td className="px-3 py-2">{c.user?.name || c.user?.email}</td>
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
                    </tr>
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
                    <th className="px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((e) => (
                    <Fragment key={e.id}>
                      <tr className="border-t border-border">
                        <td className="px-3 py-2">{e.eventName}</td>
                        <td className="px-3 py-2">{e.organizerName}</td>
                        <td className="px-3 py-2">{e.eventDate}</td>
                        <td className="px-3 py-2">{e.departments.join(", ")}</td>
                        <td className="px-3 py-2">{e.status}</td>
                        <td className="px-3 py-2">{e.memberResponse || "No response yet"}</td>
                        <td className="px-3 py-2">
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
    </div>
  );
}
