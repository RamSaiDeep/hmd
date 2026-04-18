"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { AudioLines, Mic, Speaker, Wrench } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavLink = {
  href: string;
  label: string;
};

type UserRole = "user" | "member" | "admin";

export default function NavbarWrapper() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>("user");
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function fetchRole() {
      try {
        const response = await fetch("/api/user/me", { cache: "no-store" });
        if (!response.ok) {
          setUserRole("user");
          return;
        }

        const data = (await response.json()) as { role?: string };
        setUserRole(data.role === "admin" || data.role === "member" ? data.role : "user");
      } catch {
        setUserRole("user");
      }
    }

    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await fetchRole();
      } else {
        setUserRole("user");
      }
      setLoading(false);
    }

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        void fetchRole();
      } else {
        setUserRole("user");
      }
      setLoading(false);
      setMenuOpen(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  const userName = user?.user_metadata?.name ?? user?.email ?? "";
  const navLinks: NavLink[] =
    userRole === "admin"
      ? [
          { href: "/dashboard", label: "My Dashboard" },
          { href: "/admin", label: "Admin Panel" },
        ]
      : userRole === "member"
      ? [
          { href: "/dashboard", label: "My Dashboard" },
          { href: "/member", label: "Member Dashboard" },
        ]
      : [
          { href: "/dashboard", label: "My Dashboard" },
        ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
            H
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="font-semibold text-foreground">HMD</span>
            <span className="text-xs text-muted-foreground">Hostel Maintenance</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-muted-foreground ml-2">
            <Mic className="size-4" />
            <AudioLines className="size-4" />
            <Speaker className="size-4" />
            <Wrench className="size-4" />
          </div>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link href="/" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex text-foreground")}>
            Home
          </Link>

          {!loading &&
            user &&
            navLinks.map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden md:inline-flex text-foreground")}
              >
                {item.label}
              </Link>
            ))}

          {loading ? (
            <span className="text-muted-foreground text-sm">Loading...</span>
          ) : user ? (
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-card-foreground shadow-sm hover:bg-accent"
              >
                <span aria-hidden>👤</span>
                <span className="hidden sm:inline max-w-[120px] truncate">{userName}</span>
                <span className="text-muted-foreground text-xs" aria-hidden>
                  ▾
                </span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-lg">
                  <div className="px-3 py-2 rounded-lg bg-muted text-muted-foreground text-xs font-semibold">
                    {userRole === "admin" ? "🔴 Admin" : userRole === "member" ? "🔵 Member" : "⚪ User"}
                  </div>

                  {navLinks.length > 0 && (
                    <div className="md:hidden">
                      <hr className="my-2 border-border" />
                      {navLinks.map((item) => (
                        <Link
                          key={item.href + item.label}
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          className="block px-3 py-2 rounded-lg text-sm text-foreground hover:bg-accent"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}

                  <hr className="my-2 border-border" />

                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm text-foreground hover:bg-accent"
                  >
                    Edit Profile
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
            <Link href="/login" className={cn(buttonVariants())}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
