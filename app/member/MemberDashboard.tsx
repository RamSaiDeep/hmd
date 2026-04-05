"use client";

import { useState } from "react";

export default function MemberDashboard({
  complaints,
  events,
  currentUser,
}: any) {
  const [view, setView] = useState<"all" | "mine" | "events">("all");

  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");

  // 🔥 Update complaint (real DB)
  async function updateComplaint(id: string, field: string, value: string) {
    await fetch("/api/complaints/update", {
      method: "POST",
      body: JSON.stringify({
        id,
        [field]: value,
      }),
    });

    // simple refresh
    window.location.reload();
  }

  // 🔥 Save event response (you can connect API later)
  function saveEventResponse(id: string) {
    alert("Event response saved (connect API later)");
    setRespondingId(null);
    setResponseText("");
  }

  const visibleComplaints =
    view === "mine"
      ? complaints.filter((c: any) => c.userId === currentUser.id)
      : complaints;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Member Dashboard</h1>

      {/* Tabs */}
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setView("all")}>All Complaints</button>
        <button onClick={() => setView("mine")}>My Complaints</button>
        <button onClick={() => setView("events")}>Event Requests</button>
      </div>

      {/* ===================== COMPLAINTS ===================== */}
      {(view === "all" || view === "mine") && (
        <div>
          <h2>
            {view === "all" ? "All Complaints" : "My Complaints"} (
            {visibleComplaints.length})
          </h2>

          {visibleComplaints.length === 0 ? (
            <p>No complaints found.</p>
          ) : (
            <table border={1} width="100%" cellPadding={8}>
              <thead>
                <tr>
                  <th>Place</th>
                  <th>Issue</th>
                  <th>User</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Updated By</th>
                </tr>
              </thead>
              <tbody>
                {visibleComplaints.map((c: any) => (
                  <tr key={c.id}>
                    <td>{c.place}</td>

                    <td>
                      {c.issueType}
                      {c.issueDetail && ` — ${c.issueDetail}`}
                    </td>

                    <td>{c.user?.name || c.user?.email}</td>

                    <td>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>

                    {/* STATUS */}
                    <td>
                      <select
                        value={c.status}
                        onChange={(e) =>
                          updateComplaint(c.id, "status", e.target.value)
                        }
                      >
                        <option value="NOT_STARTED">Not Started</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="FINISHED">Finished</option>
                        <option value="INVALID">Invalid</option>
                      </select>
                    </td>

                    {/* PRIORITY */}
                    <td>
                      <select
                        value={c.priority}
                        onChange={(e) =>
                          updateComplaint(c.id, "priority", e.target.value)
                        }
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>
                    </td>

                    {/* UPDATED BY */}
                    <td>{c.updatedBy || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ===================== EVENTS ===================== */}
      {view === "events" && (
        <div>
          <h2>Event Requests ({events.length})</h2>

          {events.length === 0 ? (
            <p>No events found.</p>
          ) : (
            <table border={1} width="100%" cellPadding={8}>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Organizer</th>
                  <th>Date</th>
                  <th>Departments</th>
                  <th>Status</th>
                  <th>Response</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {events.map((e: any) => (
                  <>
                    <tr key={e.id}>
                      <td>{e.eventName}</td>
                      <td>{e.organizerName}</td>
                      <td>{e.eventDate}</td>
                      <td>{e.departments.join(", ")}</td>
                      <td>{e.status}</td>
                      <td>{e.memberResponse || "No response yet"}</td>

                      <td>
                        <button
                          onClick={() => {
                            if (respondingId === e.id) {
                              setRespondingId(null);
                            } else {
                              setRespondingId(e.id);
                              setResponseText(e.memberResponse || "");
                            }
                          }}
                        >
                          {respondingId === e.id ? "Cancel" : "Respond"}
                        </button>
                      </td>
                    </tr>

                    {respondingId === e.id && (
                      <tr>
                        <td colSpan={7}>
                          <textarea
                            rows={4}
                            value={responseText}
                            onChange={(e) =>
                              setResponseText(e.target.value)
                            }
                            style={{ width: "100%" }}
                          />
                          <br />
                          <button onClick={() => saveEventResponse(e.id)}>
                            Send Response
                          </button>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}