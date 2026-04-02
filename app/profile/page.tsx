"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [room, setRoom] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const supabase = createClient();

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
  }, []);

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

      {error && <p style={{ color: "red" }}>❌ {error}</p>}
      {success && <p style={{ color: "green" }}>✅ {success}</p>}

      <div>
        <label>Full Name *</label>
        <br />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
        />
      </div>

      <br />

      <div>
        <label>Room Number</label>
        <br />
        <input
          type="text"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="A-204"
        />
      </div>

      <br />

      <div>
        <label>Phone Number</label>
        <br />
        <input
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