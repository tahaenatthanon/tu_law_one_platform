/**
 * permissions.ts — Server-side permission checks
 *
 * Usage:
 *   import { can } from "@/lib/permissions";
 *   if (can(userRoles, "projects", "approve")) { ... }
 */

const ADMIN_ROLES = ["super_admin", "system_admin"];

/** Permission matrix: action → required roles */
const PERMISSION_MAP: Record<string, string[]> = {
  // System
  "system.manage_users": ADMIN_ROLES,
  "system.manage_roles": ["super_admin"],
  "system.view_audit_log": ADMIN_ROLES,
  "system.manage_api_keys": ["super_admin"],
  "system.ad_sync": ADMIN_ROLES,
  "system.config": ADMIN_ROLES,

  // Documents
  "documents.manage_central": ADMIN_ROLES,
  "documents.manage_department": ["super_admin", "system_admin", "dept_admin"],
  "documents.upload_personal": ["super_admin", "system_admin", "dean", "dept_admin", "user"],
  "documents.view_all": ADMIN_ROLES,
  "documents.view_department": ["super_admin", "system_admin", "dept_admin"],
  "documents.view_personal": ["super_admin", "system_admin", "dean", "dept_admin", "user"],

  // Projects
  "projects.create": ["super_admin", "system_admin", "dean", "dept_admin", "user"],
  "projects.approve": ["super_admin", "system_admin", "dean", "dept_admin"],
  "projects.edit_any": ADMIN_ROLES,
  "projects.delete_any": ["super_admin"],

  // Announcements
  "announcements.create": ["super_admin", "system_admin", "dept_admin"],
  "announcements.edit_any": ADMIN_ROLES,
  "announcements.publish": ["super_admin", "system_admin", "dept_admin"],

  // Users
  "users.view": ADMIN_ROLES,
  "users.create": ADMIN_ROLES,
  "users.edit": ADMIN_ROLES,
  "users.delete": ["super_admin"],
  "users.import_csv": ADMIN_ROLES,

  // Dashboard
  "dashboard.view_all": ADMIN_ROLES,
  "dashboard.view_department": ["super_admin", "system_admin", "dean", "dept_admin"],
  "dashboard.view_own": ["super_admin", "system_admin", "dean", "dept_admin", "user", "viewer"],
};

/**
 * Check if a user (with given roles) can perform an action on a module.
 *
 * @param roles - User's role codes (e.g. ["super_admin", "user"])
 * @param module - Module name (e.g. "projects")
 * @param action - Action name (e.g. "approve")
 * @returns boolean
 */
export function can(roles: string[], module: string, action: string): boolean {
  // Super Admin can do everything
  if (roles.includes("super_admin")) return true;

  const key = `${module}.${action}`;

  // Check exact match
  if (PERMISSION_MAP[key]) {
    return roles.some((r) => PERMISSION_MAP[key].includes(r));
  }

  // Check wildcard (module.*)
  const wildcard = `${module}.*`;
  if (PERMISSION_MAP[wildcard]) {
    return roles.some((r) => PERMISSION_MAP[wildcard].includes(r));
  }

  // Default: authenticated users can perform basic actions
  const readActions = ["view", "read", "list", "search"];
  if (readActions.includes(action)) {
    return roles.length > 0;
  }

  // Default: deny write actions for non-admins
  return roles.some((r) => ADMIN_ROLES.includes(r));
}

/**
 * Check if user has at least one of the specified roles.
 */
export function hasRole(roles: string[], requiredRoles: string[]): boolean {
  return roles.some((r) => requiredRoles.includes(r));
}

/**
 * Check if user is admin (super_admin or system_admin).
 */
export function isAdmin(roles: string[]): boolean {
  return hasRole(roles, ADMIN_ROLES);
}

/**
 * Get all allowed modules for a user.
 */
export function getAllowedModules(roles: string[]): string[] {
  if (roles.includes("super_admin")) {
    return [
      "dashboard", "application-hub", "intranet",
      "documents", "projects",
      "users", "audit-log", "system-settings",
    ];
  }

  if (roles.includes("system_admin")) {
    return [
      "dashboard", "application-hub", "intranet",
      "documents", "projects",
      "users", "audit-log", "system-settings",
    ];
  }

  const modules: string[] = ["dashboard"];

  if (roles.includes("dean")) {
    modules.push("application-hub", "documents", "projects");
  }

  if (roles.includes("dept_admin")) {
    modules.push("application-hub", "intranet", "documents", "projects");
  }

  if (roles.includes("user")) {
    modules.push("application-hub", "documents", "projects");
  }

  if (roles.includes("viewer")) {
    modules.push("application-hub", "documents", "projects");
  }

  return modules;
}
