import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const mockComplaints = [
  { id: 1, place: "Room A-204", issue: "Fan not working", status: "In Progress", date: "2026-03-28", priority: "High" },
  { id: 2, place: "Room A-204", issue: "Light flickering", status: "Not Started", date: "2026-03-29", priority: "Medium" },
];

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error } = await supabase.auth.getUser();

  console.log("Dashboard — user:", user?.email ?? "not logged in");

  // Redirect to login if not logged in
  if (!user || error) {
    redirect("/login");
  }

  const userName = user.user_metadata?.name ?? user.email;
  const userRoom = user.user_metadata?.room ?? "";

  return (
    <div>
      <nav>
        <Link href="/">HMD</Link>
        <span>{user.email}</span>
        <Link href="/">← Home</Link>
      </nav>

      <h1>My Dashboard</h1>
      <p>Welcome back, {userName}</p>
      {userRoom && <p>Room: {userRoom}</p>}

      <Link href="/register-complaint">+ New Complaint</Link>

      <br /><br />

      <h2>My Complaints ({mockComplaints.length})</h2>

      {mockComplaints.length === 0 ? (
        <p>No complaints yet</p>
      ) : (
        <table border={1} width="100%">
          <thead>
            <tr>
              <th>Place</th>
              <th>Issue</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {mockComplaints.map((c) => (
              <tr key={c.id}>
                <td>{c.place}</td>
                <td>{c.issue}</td>
                <td>{c.status}</td>
                <td>{c.priority}</td>
                <td>{c.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}