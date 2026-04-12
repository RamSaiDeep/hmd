import "server-only";

import type { User as PrismaUser } from "@prisma/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

import { getPrismaClient } from "@/lib/prisma";
import { normalizeAppRole } from "@/lib/user-role";

function readMetadataString(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getNormalizedUserEmail(user: SupabaseUser): string | null {
  const email = user.email?.trim().toLowerCase();
  return email && email.length > 0 ? email : null;
}

function buildUserSyncData(user: SupabaseUser, normalizedEmail: string, existingUser?: PrismaUser) {
  return {
    email: normalizedEmail,
    name: readMetadataString(user.user_metadata?.name) ?? existingUser?.name ?? null,
    phone: readMetadataString(user.user_metadata?.phone) ?? existingUser?.phone ?? null,
    room: readMetadataString(user.user_metadata?.room) ?? existingUser?.room ?? null,
    role: normalizeAppRole(user.user_metadata?.role) ?? existingUser?.role ?? "user",
    emailVerified: user.email_confirmed_at
      ? new Date(user.email_confirmed_at)
      : existingUser?.emailVerified ?? null,
  };
}

export async function findAppUserForSupabaseUser(user: SupabaseUser) {
  const prisma = getPrismaClient();
  const normalizedEmail = getNormalizedUserEmail(user);

  if (normalizedEmail) {
    const existingByEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingByEmail) {
      return existingByEmail;
    }
  }

  return prisma.user.findUnique({
    where: { id: user.id },
  });
}

export async function syncAppUserFromSupabaseUser(user: SupabaseUser) {
  const prisma = getPrismaClient();
  const normalizedEmail = getNormalizedUserEmail(user);

  if (!normalizedEmail) {
    throw new Error("User email missing");
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingByEmail) {
    if (existingByEmail.id !== user.id) {
      console.warn("[app-user] Email-linked Prisma user uses a different id than Supabase auth", {
        prismaUserId: existingByEmail.id,
        supabaseUserId: user.id,
        email: normalizedEmail,
      });
    }

    return prisma.user.update({
      where: { id: existingByEmail.id },
      data: buildUserSyncData(user, normalizedEmail, existingByEmail),
    });
  }

  const existingById = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (existingById) {
    return prisma.user.update({
      where: { id: user.id },
      data: buildUserSyncData(user, normalizedEmail, existingById),
    });
  }

  return prisma.user.create({
    data: {
      id: user.id,
      ...buildUserSyncData(user, normalizedEmail),
    },
  });
}
