"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { 
  ArrowLeft, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Home, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  getRoleBadgeClass, 
  getRoleLabel, 
  parseUserRole, 
  type UserRole 
} from "@/lib/roles";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [room, setRoom] = useState("");
  const [role, setRole] = useState<UserRole>("user");
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

      // Fetch user role from database
      try {
        const roleResponse = await fetch("/api/user/me", { cache: "no-store" });
        if (roleResponse.ok) {
          const roleData = (await roleResponse.json()) as { role?: string };
          setRole(parseUserRole(roleData.role));
        }
      } catch (roleError) {
        console.error("Role fetch error:", roleError);
        setRole("user");
      }

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
    const { error: updateError } = await supabase.auth.updateUser({
      data: { name: name.trim(), phone: phone.trim(), room: room.trim() },
    });

    if (updateError) {
      console.log("Profile save error:", updateError.message);
      setError(updateError.message);
    } else {
      // Also sync to our Prisma database
      const syncRes = await fetch("/api/user/sync", { method: "POST" });
      if (syncRes.ok) {
        console.log("Profile saved successfully");
        setSuccess("Profile updated successfully!");
      } else {
        const syncErrorData = (await syncRes.json().catch(() => ({}))) as { error?: string };
        setError(syncErrorData.error || "Failed to sync changes with the database.");
      }
    }

    setSaving(false);
  }

  // Get initials for the avatar based on name or email
  const getInitials = (nameStr: string, emailStr: string) => {
    const cleanName = nameStr.trim();
    if (cleanName) {
      const parts = cleanName.split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return cleanName.substring(0, 2).toUpperCase();
    }
    if (emailStr) {
      return emailStr.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  // Get gradient background classes for avatar based on role
  const getAvatarGradient = (userRole: UserRole) => {
    switch (userRole) {
      case "superuser":
        return "from-purple-500 to-indigo-600 text-white";
      case "admin":
        return "from-red-500 to-rose-600 text-white";
      case "member":
        return "from-blue-500 to-cyan-600 text-white";
      default:
        return "from-teal-500 to-emerald-600 text-white";
    }
  };

  // Get accessible description based on role
  const getRoleDescription = (userRole: UserRole) => {
    switch (userRole) {
      case "superuser":
        return "Full administrative authority. You can manage complaints, bookings, adjust settings, and manage user roles.";
      case "admin":
        return "Administrative access. You can manage maintenance tickets, studio bookings, and assign roles to members.";
      case "member":
        return "Operational access. You can view, accept, and resolve complaints and bookings assigned to you.";
      default:
        return "Student self-service. You can submit complaints, request equipment, and book recording slots.";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation & Title Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-3 group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your personal information, room number, and contact details.
          </p>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Avatar & Summary Card */}
          <div className="md:col-span-1">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col items-center text-center">
              
              {/* Profile Avatar with gradient background */}
              <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getAvatarGradient(role)} flex items-center justify-center text-3xl font-bold tracking-wide shadow-md mb-4`}>
                {getInitials(name, user?.email ?? "")}
              </div>
              
              <h2 className="text-xl font-bold text-foreground line-clamp-1 max-w-full">
                {name || "HMD User"}
              </h2>
              <p className="text-xs text-muted-foreground mt-1 mb-4 break-all max-w-full">
                {user?.email}
              </p>
              
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${getRoleBadgeClass(role)}`}>
                {getRoleLabel(role)}
              </span>

              <hr className="w-full my-5 border-border" />

              <div className="w-full text-left">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Access Level Info
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {getRoleDescription(role)}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Update Profile Form */}
          <div className="md:col-span-2">
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-1">Profile Details</h3>
              <p className="text-xs text-muted-foreground mb-6">
                Update your details below. These are shared with Hostel Maintenance Department representatives to reach you.
              </p>

              {/* Status Alert Banners */}
              {error && (
                <div className="mb-6 p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive flex items-start gap-3" role="alert">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-sm">Update Failed</h5>
                    <p className="text-xs opacity-90 mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 rounded-xl border border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400 flex items-start gap-3" role="status">
                  <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-sm">Success</h5>
                    <p className="text-xs opacity-90 mt-0.5">{success}</p>
                  </div>
                </div>
              )}

              <div className="space-y-5">
                
                {/* Email (Readonly) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5" htmlFor="email">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={user?.email ?? ""}
                    disabled
                    className="rounded-xl px-4 py-3 text-sm text-foreground/50 border border-border bg-muted cursor-not-allowed select-none outline-none"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Your email is tied to your account login credentials and cannot be edited.
                  </p>
                </div>

                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground flex items-center gap-1.5" htmlFor="fullName">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    Full Name *
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary border border-border bg-background transition"
                    required
                  />
                </div>

                {/* Room Number */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground flex items-center gap-1.5" htmlFor="roomNumber">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    Room Number
                  </label>
                  <input
                    id="roomNumber"
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="e.g. A-204"
                    className="rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary border border-border bg-background transition"
                  />
                </div>

                {/* Phone Number */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground flex items-center gap-1.5" htmlFor="phoneNumber">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Phone Number
                  </label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary border border-border bg-background transition"
                  />
                </div>

                {/* Form Buttons */}
                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 justify-center py-2.5 h-11"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                  <Link
                    href="/dashboard"
                    className="flex-1 sm:flex-none"
                  >
                    <Button
                      variant="outline"
                      type="button"
                      className="w-full justify-center py-2.5 h-11"
                    >
                      Cancel
                    </Button>
                  </Link>
                </div>
                
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}