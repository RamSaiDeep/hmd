import { prisma } from "@/lib/prisma";
import type { User as AuthUser } from "@supabase/supabase-js";

function stringOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

export function extractSignupProfile(authUser: AuthUser) {
  return {
    email: authUser.email?.trim().toLowerCase() ?? null,
    name: stringOrNull(authUser.user_metadata?.name),
    phone: stringOrNull(authUser.user_metadata?.phone),
    room: stringOrNull(authUser.user_metadata?.room),
    emailVerified: authUser.email_confirmed_at
      ? new Date(authUser.email_confirmed_at)
      : null,
  };
}

export async function syncAuthUserToPrisma(authUser: AuthUser) {
  const profile = extractSignupProfile(authUser);

  if (!profile.email) {
    throw new Error("User email missing");
  }

  const existing = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  if (existing) {
    return prisma.user.update({
      where: { id: authUser.id },
      data: {
        email: profile.email,
        name: profile.name ?? existing.name,
        phone: profile.phone ?? existing.phone,
        room: profile.room ?? existing.room,
        emailVerified: profile.emailVerified ?? existing.emailVerified,
      },
    });
  }

  return prisma.user.create({
    data: {
      id: authUser.id,
      email: profile.email,
      name: profile.name,
      phone: profile.phone,
      room: profile.room,
      role: "user",
      emailVerified: profile.emailVerified,
    },
  });
}
