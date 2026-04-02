"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export default function NavbarWrapper() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    // Get current user on mount
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      console.log("Navbar — user:", user?.email ?? "not logged in");
      setUser(user);
      setLoading(false);
    }

    getUser();

    // Listen for auth changes — login/logout updates navbar automatically
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("Navbar — auth state changed:", session?.user?.email ?? "logged out");
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  async function handleLogout() {
    console.log("Logging out:", user?.email);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const userName = user?.user_metadata?.name ?? user?.email ?? "";
  const userRole = user?.user_metadata?.role ?? "user";

  return (
    <nav>
      {/* Logo */}
      <Link href="/">
        <strong>HMD</strong>
      </Link>

      {/* Right side */}
      <div>
        <Link href="/">Home</Link>

        {loading ? (
          <span>...</span>
        ) : user ? (
          // Logged in state
          <div>
            {/* User button - click to open dropdown */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
            >
              👤 {userName} ▾
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <div>
                {/* Show role */}
                <span>
                  {userRole === "admin" ? "🔴 Admin" : userRole === "member" ? "🔵 Member" : "⚪ User"}
                </span>

                <hr />

                {/* Dashboard link based on role */}
                {userRole === "admin" ? (
                  <Link href="/admin" onClick={() => setMenuOpen(false)}>
                    Admin Dashboard
                  </Link>
                ) : userRole === "member" ? (
                  <>
                    <Link href="/member" onClick={() => setMenuOpen(false)}>
                      Member Dashboard
                    </Link>
                    <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                      My Complaints
                    </Link>
                  </>
                ) : (
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                    My Dashboard
                  </Link>
                )}

                <Link href="/profile" onClick={() => setMenuOpen(false)}>
                  Update Profile
                </Link>

                <hr />

                <button
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          // Logged out state
          <Link href="/login">Login / Sign Up</Link>
        )}
      </div>
    </nav>
  );
}