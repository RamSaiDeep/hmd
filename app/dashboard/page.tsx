"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Complaint } from "@prisma/client";
import type { User } from "@supabase/supabase-js";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadDashboard() {
      try {
        // Get current user
        const { data: { user }, error } = await supabase.auth.getUser();

        console.log("Dashboard — user:", user?.email ?? "not logged in");

        // Redirect to login if not logged in
        if (!user || error) {
          router.push("/login");
          return;
        }

        setUser(user);

        // Fetch complaints
        try {
          const response = await fetch("/api/complaints");
          if (response.ok) {
            const data = await response.json();
            setComplaints(data.complaints || []);
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

    loadDashboard();
  }, [supabase, router]);

  if (loading) {
    return <div className="mx-auto w-full max-w-5xl px-4 py-8">Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect
  }

  const userName = user.user_metadata?.name ?? user.email;
  const userRoom = user.user_metadata?.room ?? "";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">My Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {userName}</p>
          {userRoom && <p className="text-muted-foreground">Room: {userRoom}</p>}
        </div>

        <Link href="/register-complaint" className={cn(buttonVariants())}>
          New complaint
        </Link>
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
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complaints.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.place}</TableCell>
                    <TableCell>
                      {c.issueType}
                      {c.issueDetail ? ` — ${c.issueDetail}` : ""}
                    </TableCell>
                    <TableCell>{c.status}</TableCell>
                    <TableCell>{c.priority}</TableCell>
                    <TableCell>{dateFormatter.format(new Date(c.createdAt))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
