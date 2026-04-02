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
    <nav className="border-b border-[var(--color-border)] bg-[var(--color-bg)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-[var(--color-primary-light)] rounded-lg flex items-center justify-center text-white font-bold">
            H
          </div>
          <span className="font-bold text-lg text-[var(--color-text)] hidden sm:inline">HMD</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <Link href="/" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition text-sm font-medium">
            Home
          </Link>

          {loading ? (
            <span className="text-[var(--color-text-tertiary)] text-sm">Loading...</span>
          ) : user ? (
            // Logged in state
            <div className="relative">
              {/* User button - click to open dropdown */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-[var(--color-primary-light)] text-[var(--color-text)] transition text-sm font-medium"
              >
                <span>👤</span>
                <span className="hidden sm:inline max-w-[120px] truncate">{userName}</span>
                <span className="text-[var(--color-text-tertiary)] text-xs">▾</span>
              </button>

              {/* Dropdown menu */}
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg shadow-xl p-4 space-y-2">
                  {/* Show role */}
                  <div className="px-3 py-2 rounded-lg bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] text-xs font-semibold">
                    {userRole === "admin" ? "🔴 Admin" : userRole === "member" ? "🔵 Member" : "⚪ User"}
                  </div>

                  <hr className="border-[var(--color-border)] my-2" />

                  {/* Dashboard link based on role */}
                  <div className="space-y-2">
                    {userRole === "admin" ? (
                      <Link 
                        href="/admin" 
                        onClick={() => setMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-primary-light)] hover:bg-[var(--color-bg-tertiary)] transition text-sm"
                      >
                        Admin Dashboard
                      </Link>
                    ) : userRole === "member" ? (
                      <>
                        <Link 
                          href="/member" 
                          onClick={() => setMenuOpen(false)}
                          className="block px-3 py-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-primary-light)] hover:bg-[var(--color-bg-tertiary)] transition text-sm"
                        >
                          Member Dashboard
                        </Link>
                        <Link 
                          href="/dashboard" 
                          onClick={() => setMenuOpen(false)}
                          className="block px-3 py-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-primary-light)] hover:bg-[var(--color-bg-tertiary)] transition text-sm"
                        >
                          My Complaints
                        </Link>
                      </>
                    ) : (
                      <Link 
                        href="/dashboard" 
                        onClick={() => setMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-primary-light)] hover:bg-[var(--color-bg-tertiary)] transition text-sm"
                      >
                        My Dashboard
                      </Link>
                    )}
                  </div>

                  <Link 
                    href="/profile" 
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-primary-light)] hover:bg-[var(--color-bg-tertiary)] transition text-sm"
                  >
                    Update Profile
                  </Link>

                  <hr className="border-[var(--color-border)] my-2" />

                  <button
                    onClick={handleLogout}
                    className="w-full px-3 py-2 rounded-lg text-[var(--color-accent-red)] hover:bg-[var(--color-bg-tertiary)] transition text-sm font-medium text-left"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Logged out state
            <Link 
              href="/login"
              className="px-4 py-2 rounded-lg bg-[var(--color-primary-light)] text-[var(--color-bg)] hover:bg-[var(--color-primary-lighter)] transition font-semibold text-sm"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
