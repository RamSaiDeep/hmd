"use client";

import { useState } from "react";

type UserItem = {
  id: string;
  name?: string | null;
  email: string;
  role: string;
};

export default function AssignModal({
  isOpen,
  onClose,
  requestId,
  requestType,
  users,
  onAssigned,
}: {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  requestType: "complaint" | "event" | "music" | "studio";
  users: UserItem[];
  onAssigned: () => void;
}) {
  const [selectedMember, setSelectedMember] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const members = users.filter((u) => u.role === "member" || u.role === "admin" || u.role === "superuser");

  async function handleAssign() {
    if (!selectedMember) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: requestId, type: requestType, memberId: selectedMember }),
      });

      if (res.ok) {
        onAssigned();
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to assign");
      }
    } catch (e) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-xl bg-background p-6 shadow-lg border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Assign Member</h3>
        
        {error && <div className="mb-4 text-sm text-red-500 bg-red-50 p-2 rounded">{error}</div>}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Select Member</label>
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">-- Choose a member --</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name || m.email} ({m.role})
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-border px-4 py-2 text-sm hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedMember || loading}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Assigning..." : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
}
