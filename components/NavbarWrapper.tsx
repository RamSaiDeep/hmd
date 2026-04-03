"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { AudioLines, Mic, Speaker, Wrench } from "lucide-react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const dashboardHref =
    userRole === "admin" ? "/admin" : userRole === "member" ? "/member" : "/dashboard";

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
            H
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="font-semibold">HMD</span>
            <span className="text-xs text-muted-foreground">Hostel Maintenance</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-muted-foreground ml-2">
            <Mic className="size-4" />
            <AudioLines className="size-4" />
            <Speaker className="size-4" />
            <Wrench className="size-4" />
          </div>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Home
          </Link>

          {!loading && user && (
            <Link
              href={dashboardHref}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Dashboard
            </Link>
          )}

          <ThemeToggle />

          {loading ? (
            <span className="text-muted-foreground text-sm">Loading...</span>
          ) : user ? (
            // Logged in state
            <div className="relative">
              {/* User button - click to open dropdown */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2 text-sm font-medium shadow-sm hover:bg-accent"
              >
                <span aria-hidden>👤</span>
                <span className="hidden sm:inline max-w-[120px] truncate">{userName}</span>
                <span className="text-muted-foreground text-xs" aria-hidden>▾</span>
              </button>

              {/* Dropdown menu */}
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border bg-background p-2 shadow-lg">
                  {/* Show role */}
                  <div className="px-3 py-2 rounded-lg bg-muted text-muted-foreground text-xs font-semibold">
                    {userRole === "admin" ? "🔴 Admin" : userRole === "member" ? "🔵 Member" : "⚪ User"}
                  </div>

                  <hr className="my-2 border-border" />

                  {/* Dashboard link based on role */}
                  <div className="space-y-2">
                    {userRole === "admin" ? (
                      <Link 
                        href="/admin" 
                        onClick={() => setMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg text-sm hover:bg-accent"
                      >
                        Admin Dashboard
                      </Link>
                    ) : userRole === "member" ? (
                      <>
                        <Link 
                          href="/member" 
                          onClick={() => setMenuOpen(false)}
                          className="block px-3 py-2 rounded-lg text-sm hover:bg-accent"
                        >
                          Member Dashboard
                        </Link>
                        <Link 
                          href="/dashboard" 
                          onClick={() => setMenuOpen(false)}
                          className="block px-3 py-2 rounded-lg text-sm hover:bg-accent"
                        >
                          My Complaints
                        </Link>
                      </>
                    ) : (
                      <Link 
                        href="/dashboard" 
                        onClick={() => setMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg text-sm hover:bg-accent"
                      >
                        My Dashboard
                      </Link>
                    )}
                  </div>

                  <Link 
                    href="/profile" 
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm hover:bg-accent"
                  >
                    Update Profile
                  </Link>

                  <hr className="my-2 border-border" />

                  <button
                    onClick={handleLogout}
                    className="w-full px-3 py-2 rounded-lg text-sm font-medium text-left text-destructive hover:bg-accent"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Logged out state
            <Link href="/login" className={cn(buttonVariants())}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
