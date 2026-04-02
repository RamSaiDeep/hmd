"use client";
import { useState } from "react";
import Link from "next/link";

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

type User = {
  id: number;
  name: string;
  email: string;
  room: string;
  phone: string;
  role: string;
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

const initialUsers: User[] = [
  { id: 1, name: "Ravi Kumar", email: "ravi@hmd.com", room: "A-101", phone: "9876543210", role: "user" },
  { id: 2, name: "Priya S", email: "priya@hmd.com", room: "B-204", phone: "9876543211", role: "member" },
  { id: 3, name: "Arjun M", email: "arjun@hmd.com", room: "C-310", phone: "9876543212", role: "user" },
  { id: 4, name: "Sneha R", email: "sneha@hmd.com", room: "A-205", phone: "9876543213", role: "member" },
  { id: 5, name: "Ram Sai", email: "ram@hmd.com", room: "C-310", phone: "9876543214", role: "user" },
];

const statusOptions = ["Not Started", "In Progress", "Finished", "Invalid Request"];
const priorityOptions = ["Low", "Medium", "High"];

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState(initialComplaints);
  const [events, setEvents] = useState(initialEvents);
  const [users, setUsers] = useState(initialUsers);

  const [view, setView] = useState<"complaints" | "events" | "users">("complaints");

  // Separate delete confirm state for each table
  const [deleteComplaintId, setDeleteComplaintId] = useState<number | null>(null);
  const [deleteEventId, setDeleteEventId] = useState<number | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);

  // Event response
  const [respondingId, setRespondingId] = useState<number | null>(null);
  const [responseText, setResponseText] = useState("");

  function updateComplaint(id: number, field: "status" | "priority", value: string) {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  }

  function deleteComplaint(id: number) {
    setComplaints((prev) => prev.filter((c) => c.id !== id));
    setDeleteComplaintId(null);
  }

  function deleteEvent(id: number) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setDeleteEventId(null);
  }

  function deleteUser(id: number) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setDeleteUserId(null);
  }

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

  function toggleRole(userId: number) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, role: u.role === "member" ? "user" : "member" }
          : u
      )
    );
  }

  return (
    <div>
      <nav>
        <Link href="/">HMD</Link>
        <span>Admin</span>
        <Link href="/">← Home</Link>
      </nav>

      <h1>Admin Dashboard</h1>

      {/* Tab switcher */}
      <div>
        <button onClick={() => setView("complaints")}>Complaints ({complaints.length})</button>
        <button onClick={() => setView("events")}>Event Requests ({events.length})</button>
        <button onClick={() => setView("users")}>Users ({users.length})</button>
      </div>

      {/* COMPLAINTS TABLE */}
      {view === "complaints" && (
        <div>
          <h2>All Complaints ({complaints.length})</h2>

          <table border={1} width="100%">
            <thead>
              <tr>
                <th>Place</th>
                <th>Issue</th>
                <th>User</th>
                <th>Date</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c.id}>
                  <td>{c.place}</td>
                  <td>
                    {c.issue}
                    {c.issueDetail && ` — ${c.issueDetail}`}
                  </td>
                  <td>{c.user}</td>
                  <td>{c.date}</td>
                  <td>
                    <select
                      value={c.status}
                      onChange={(e) => updateComplaint(c.id, "status", e.target.value)}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      value={c.priority}
                      onChange={(e) => updateComplaint(c.id, "priority", e.target.value)}
                    >
                      {priorityOptions.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {deleteComplaintId === c.id ? (
                      <span>
                        Sure?{" "}
                        <button onClick={() => deleteComplaint(c.id)}>Yes</button>
                        {" / "}
                        <button onClick={() => setDeleteComplaintId(null)}>No</button>
                      </span>
                    ) : (
                      <button onClick={() => setDeleteComplaintId(c.id)}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                <th>Respond</th>
                <th>Delete</th>
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
                    <td>{e.memberResponse || "No response yet"}</td>
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
                    <td>
                      {deleteEventId === e.id ? (
                        <span>
                          Sure?{" "}
                          <button onClick={() => deleteEvent(e.id)}>Yes</button>
                          {" / "}
                          <button onClick={() => setDeleteEventId(null)}>No</button>
                        </span>
                      ) : (
                        <button onClick={() => setDeleteEventId(e.id)}>Delete</button>
                      )}
                    </td>
                  </tr>

                  {respondingId === e.id && (
                    <tr key={`respond-${e.id}`}>
                      <td colSpan={8}>
                        <p>Tell the organizer what you can provide or suggest alternatives:</p>
                        <textarea
                          rows={4}
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="e.g. We can provide 2 wireless mics. For lighting warm white is available..."
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
        </div>
      )}

      {/* USERS TABLE */}
      {view === "users" && (
        <div>
          <h2>All Users ({users.length})</h2>

          <table border={1} width="100%">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Room</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Promote / Demote</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.room}</td>
                  <td>{u.phone}</td>
                  <td>{u.role}</td>
                  <td>
                    <button onClick={() => toggleRole(u.id)}>
                      {u.role === "member" ? "Remove from member" : "Make member"}
                    </button>
                  </td>
                  <td>
                    {deleteUserId === u.id ? (
                      <span>
                        Sure?{" "}
                        <button onClick={() => deleteUser(u.id)}>Yes</button>
                        {" / "}
                        <button onClick={() => setDeleteUserId(null)}>No</button>
                      </span>
                    ) : (
                      <button onClick={() => setDeleteUserId(u.id)}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}