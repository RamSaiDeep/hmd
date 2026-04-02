"use client";
import { useState } from "react";

type Complaint = {
  id: number;
  user: string;
  place: string;
  issue: string;
  issueDetail: string;
  status: string;
  priority: string;
  date: string;
};

type EventRequest = {
  id: number;
  eventName: string;
  organizer: string;
  date: string;
  departments: string[];
  status: string;
  memberResponse: string;
};

const initialComplaints: Complaint[] = [
  { id: 1, user: "Ravi Kumar", place: "Room A-101", issue: "Fan", issueDetail: "", status: "Not Started", priority: "Medium", date: "2026-03-28" },
  { id: 2, user: "Priya S", place: "Room B-204", issue: "Light", issueDetail: "", status: "In Progress", priority: "High", date: "2026-03-27" },
  { id: 3, user: "Arjun M", place: "Common Room", issue: "Other", issueDetail: "Ceiling paint peeling", status: "Finished", priority: "Low", date: "2026-03-25" },
  { id: 4, user: "Sneha R", place: "Room A-205", issue: "Lock", issueDetail: "", status: "Not Started", priority: "Medium", date: "2026-03-29" },
  { id: 5, user: "Ram Sai", place: "Room C-310", issue: "Switch", issueDetail: "", status: "Invalid Request", priority: "Low", date: "2026-03-30" },
];

const initialEvents: EventRequest[] = [
  { id: 1, eventName: "Annual Cultural Fest", organizer: "Sumanth K", date: "2026-04-15", departments: ["Dhwani", "Prakash"], status: "Pending", memberResponse: "" },
  { id: 2, eventName: "Fresher's Night", organizer: "Ravi Kumar", date: "2026-04-20", departments: ["Dhwani", "Kriti"], status: "Responded", memberResponse: "We can provide 2 wireless mics and basic stage setup" },
];

const statusOptions = ["Not Started", "In Progress", "Finished", "Invalid Request"];
const priorityOptions = ["Low", "Medium", "High"];

// Pretend this is the logged in member
const loggedInUser = "Ram Sai";

export default function MemberDashboard() {
  const [complaints, setComplaints] = useState(initialComplaints);
  const [events, setEvents] = useState(initialEvents);

  // Which tab is active
  const [view, setView] = useState<"all" | "mine" | "events">("all");

  // For event response panel
  const [respondingId, setRespondingId] = useState<number | null>(null);
  const [responseText, setResponseText] = useState("");

  // Update complaint status or priority directly from dropdown
  function updateComplaint(id: number, field: "status" | "priority", value: string) {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  }

  // Save member response to an event request
  function saveEventResponse(id: number) {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, status: "Responded", memberResponse: responseText }
          : e
      )
    );
    setRespondingId(null);
    setResponseText("");
  }

  const visibleComplaints =
    view === "mine"
      ? complaints.filter((c) => c.user === loggedInUser)
      : complaints;

  return (
    <div>

      <h1>Member Dashboard</h1>

      {/* Tab switcher */}
      <div>
        <button onClick={() => setView("all")}>All Complaints</button>
        <button onClick={() => setView("mine")}>My Complaints</button>
        <button onClick={() => setView("events")}>Event Requests</button>
      </div>

      {/* COMPLAINTS TABLE */}
      {(view === "all" || view === "mine") && (
        <div>
          <h2>{view === "all" ? "All Complaints" : "My Complaints"} ({visibleComplaints.length})</h2>

          {visibleComplaints.length === 0 ? (
            <p>No complaints here.</p>
          ) : (
            <table border={1} width="100%">
              <thead>
                <tr>
                  <th>Place</th>
                  <th>Issue</th>
                  <th>User</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {visibleComplaints.map((c) => (
                  <tr key={c.id}>
                    <td>{c.place}</td>
                    <td>
                      {c.issue}
                      {c.issueDetail && ` — ${c.issueDetail}`}
                    </td>
                    <td>{c.user}</td>
                    <td>{c.date}</td>

                    {/* Status dropdown - member can change this */}
                    <td>
                      <select
                        value={c.status}
                        onChange={(e) => updateComplaint(c.id, "status", e.target.value)}
                        aria-label={`Complaint ${c.id} status`}
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>

                    {/* Priority dropdown - member can change this */}
                    <td>
                      <select
                        value={c.priority}
                        onChange={(e) => updateComplaint(c.id, "priority", e.target.value)}
                        aria-label={`Complaint ${c.id} priority`}
                      >
                        {priorityOptions.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* EVENT REQUESTS TABLE */}
      {view === "events" && (
        <div>
          <h2>Event Requests ({events.length})</h2>

          <table border={1} width="100%">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Organizer</th>
                <th>Date</th>
                <th>Departments</th>
                <th>Status</th>
                <th>Response</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <>
                  <tr key={e.id}>
                    <td>{e.eventName}</td>
                    <td>{e.organizer}</td>
                    <td>{e.date}</td>
                    <td>{e.departments.join(", ")}</td>
                    <td>{e.status}</td>
                    <td>
                      {e.memberResponse
                        ? e.memberResponse
                        : "No response yet"}
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          if (respondingId === e.id) {
                            setRespondingId(null);
                          } else {
                            setRespondingId(e.id);
                            setResponseText(e.memberResponse);
                          }
                        }}
                      >
                        {respondingId === e.id ? "Cancel" : "Respond"}
                      </button>
                    </td>
                  </tr>

                  {/* Response panel - shows below the row when Respond is clicked */}
                  {respondingId === e.id && (
                    <tr key={`respond-${e.id}`}>
                      <td colSpan={7}>
                        <p>Tell the organizer what you can provide or suggest alternatives:</p>
                        <textarea
                          rows={4}
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="e.g. We can provide 2 wireless mics. For lighting we have warm white available. Instead of a stage platform we can do risers..."
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
        </div>
      )}
    </div>
  );
}