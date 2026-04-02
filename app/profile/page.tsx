"use client";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [room, setRoom] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function getUser() {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        console.log("Profile — not logged in, redirecting");
        router.push("/login");
        return;
      }

      console.log("Profile — loaded user:", user.email);
      setUser(user);
      setName(user.user_metadata?.name ?? "");
      setPhone(user.user_metadata?.phone ?? "");
      setRoom(user.user_metadata?.room ?? "");
      setLoading(false);
    }

    getUser();
  }, [router, supabase.auth]);

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Name is required");
      setSaving(false);
      return;
    }

    console.log("Saving profile for:", user?.email);

    // Update user metadata in Supabase Auth
    const { error } = await supabase.auth.updateUser({
      data: { name, phone, room },
    });

    if (error) {
      console.log("Profile save error:", error.message);
      setError(error.message);
    } else {
      // Also sync to our Prisma database
      await fetch("/api/user/sync", { method: "POST" });
      console.log("Profile saved successfully");
      setSuccess("Profile updated successfully!");
    }

    setSaving(false);
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Update Profile</h1>
      <p>Email: {user?.email} (cannot be changed)</p>

      {error && <p role="alert">❌ {error}</p>}
      {success && <p role="status">✅ {success}</p>}

      <div>
        <label htmlFor="fullName">Full Name *</label>
        <br />
        <input
          id="fullName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
        />
      </div>

      <br />

      <div>
        <label htmlFor="roomNumber">Room Number</label>
        <br />
        <input
          id="roomNumber"
          type="text"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="A-204"
        />
      </div>

      <br />

      <div>
        <label htmlFor="phoneNumber">Phone Number</label>
        <br />
        <input
          id="phoneNumber"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 98765 43210"
        />
      </div>

      <br />

      <button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}