"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function NavbarWrapper() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

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
  }, []);

  async function handleLogout() {
    console.log("Logging out:", user?.email);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const userName = user?.user_metadata?.name ?? user?.email ?? "";
  const userRole = user?.user_metadata?.role ?? "user";

  return (
    <nav style={{ borderBottom: "1px solid #ccc", padding: "12px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      {/* Logo */}
      <Link href="/">
        <strong>HMD</strong>
      </Link>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <Link href="/">Home</Link>

        {loading ? (
          <span>...</span>
        ) : user ? (
          // Logged in state
          <div style={{ position: "relative" }}>
            {/* User button - click to open dropdown */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ cursor: "pointer" }}
            >
              👤 {userName} ▾
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "100%",
                  background: "#1a2332",
                  border: "1px solid #333",
                  borderRadius: "8px",
                  padding: "8px",
                  minWidth: "180px",
                  zIndex: 100,
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                {/* Show role */}
                <span style={{ fontSize: "12px", color: "#888", padding: "4px 8px" }}>
                  {userRole === "admin" ? "🔴 Admin" : userRole === "member" ? "🔵 Member" : "⚪ User"}
                </span>

                <hr style={{ border: "none", borderTop: "1px solid #333", margin: "4px 0" }} />

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

                <hr style={{ border: "none", borderTop: "1px solid #333", margin: "4px 0" }} />

                <button
                  onClick={handleLogout}
                  style={{ cursor: "pointer", color: "red", textAlign: "left", background: "none", border: "none", padding: "4px 8px" }}
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