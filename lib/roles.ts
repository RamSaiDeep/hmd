export type UserRole = "user" | "member" | "admin" | "superuser";

export const ROLE_RANK: Record<UserRole, number> = {
  user: 0,
  member: 1,
  admin: 2,
  superuser: 3,
};

export const ASSIGNABLE_ROLES: UserRole[] = ["user", "member", "admin"];

export function parseUserRole(role: string | null | undefined): UserRole {
  if (role === "member" || role === "admin" || role === "superuser") return role;
  return "user";
}

export function hasMinRole(role: string | null | undefined, min: UserRole): boolean {
  return ROLE_RANK[parseUserRole(role)] >= ROLE_RANK[min];
}

export function canAccessMemberDashboard(role: string | null | undefined): boolean {
  return hasMinRole(role, "member");
}

export function canAccessAdminPanel(role: string | null | undefined): boolean {
  return hasMinRole(role, "admin");
}

export function canAccessSuperuserPanel(role: string | null | undefined): boolean {
  return parseUserRole(role) === "superuser";
}

export function canAssignRole(
  actorRole: string | null | undefined,
  targetCurrentRole: string | null | undefined,
  newRole: UserRole
): boolean {
  const actor = parseUserRole(actorRole);
  const target = parseUserRole(targetCurrentRole);

  if (newRole === "superuser") return false;
  if (target === "superuser") return false;

  if (actor === "superuser") {
    return newRole === "user" || newRole === "member" || newRole === "admin";
  }

  if (actor === "admin") {
    if (target === "admin") return false;
    return newRole === "user" || newRole === "member";
  }

  return false;
}

export function canDeleteUser(
  actorRole: string | null | undefined,
  targetRole: string | null | undefined,
  actorId: string,
  targetId: string
): boolean {
  if (actorId === targetId) return false;

  const actor = parseUserRole(actorRole);
  const target = parseUserRole(targetRole);

  if (target === "superuser") return false;
  if (actor === "superuser") return true;
  if (actor === "admin") return target === "user" || target === "member";

  return false;
}

export function getNavLinks(role: string | null | undefined): Array<{ href: string; label: string }> {
  const links: Array<{ href: string; label: string }> = [
    { href: "/dashboard", label: "My Dashboard" },
  ];

  const parsed = parseUserRole(role);

  if (parsed === "member") {
    links.push({ href: "/member", label: "Member Dashboard" });
  } else if (parsed === "admin") {
    links.push({ href: "/admin", label: "Admin Panel" });
  } else if (parsed === "superuser") {
    links.push({ href: "/superuser", label: "Super User Panel" });
  }

  return links;
}

export function getRoleLabel(role: string | null | undefined): string {
  const parsed = parseUserRole(role);
  if (parsed === "superuser") return "Super User";
  if (parsed === "admin") return "Admin";
  if (parsed === "member") return "Member";
  return "User";
}

export function getRoleBadgeClass(role: string | null | undefined): string {
  const parsed = parseUserRole(role);
  if (parsed === "superuser") return "bg-purple-100 text-purple-800";
  if (parsed === "admin") return "bg-red-100 text-red-800";
  if (parsed === "member") return "bg-blue-100 text-blue-800";
  return "bg-gray-100 text-gray-800";
}

export function getRoleMenuLabel(role: string | null | undefined): string {
  const parsed = parseUserRole(role);
  if (parsed === "superuser") return "🟣 Super User";
  if (parsed === "admin") return "🔴 Admin";
  if (parsed === "member") return "🔵 Member";
  return "⚪ User";
}
