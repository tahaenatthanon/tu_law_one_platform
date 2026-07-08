"use client";

import { useSession } from "next-auth/react";
import { useMemo, useCallback } from "react";

/**
 * usePermission — hook for role-based access checks
 * 
 * Usage:
 *   const { hasRole, isAdmin, can } = usePermission();
 *   if (can("projects", "approve")) { ... }
 */

const ADMIN_ROLES = ["super_admin", "system_admin"];

export function usePermission() {
  const { data: session } = useSession();
  
  const roles: string[] = useMemo(
    () => (session?.user as Record<string, unknown>)?.roles as string[] ?? [],
    [session?.user]
  );

  const isAdmin = useMemo(
    () => roles.some((r) => ADMIN_ROLES.includes(r)),
    [roles]
  );

  const hasRole = useCallback(
    (requiredRoles: string[]) => requiredRoles.some((r) => roles.includes(r)),
    [roles]
  );

  /**
   * can() — granular permission check
   * Maps actions to required roles
   */
  const can = useCallback(
    (module: string, action: string): boolean => {
      // Super Admin can do everything
      if (roles.includes("super_admin")) return true;

      // Admin actions
      const adminActions = [
        "manage_users", "manage_roles", "system_config",
        "view_audit_log", "manage_api_keys", "ad_sync",
        "manage_applications",
      ];
      if (adminActions.includes(`${module}.${action}`) || adminActions.includes(action)) {
        return isAdmin;
      }

      // Department admin actions
      const deptActions = [
        "approve_project", "manage_department_docs",
        "manage_announcements",
      ];
      if (deptActions.includes(action)) {
        return roles.includes("dept_admin") || isAdmin;
      }

      // Default: any authenticated user
      return roles.length > 0;
    },
    [roles, isAdmin]
  );

  return { roles, isAdmin, hasRole, can };
}
