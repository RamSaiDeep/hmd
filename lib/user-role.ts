import type { User } from "@supabase/supabase-js";

export type AppRole = "user" | "member" | "admin";

export function normalizeAppRole(raw: unknown): AppRole | null {
  if (raw === "admin" || raw === "member" || raw === "user") return raw;
  return null;
}

/** Prefer Prisma role; if missing or invalid, use Supabase user_metadata (e.g. prod DB not synced yet). */
export function resolveAppRole(
  dbRole: string | null | undefined,
  supabaseUser: User | null
): AppRole {
  return (
    normalizeAppRole(dbRole) ??
    normalizeAppRole(supabaseUser?.user_metadata?.role) ??
    "user"
  );
}
