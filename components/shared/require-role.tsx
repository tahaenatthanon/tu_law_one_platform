"use client";

import { useSession } from "next-auth/react";
import { type ReactNode } from "react";
import { ShieldOff } from "lucide-react";

/**
 * RequireRole — wrapper component that checks user roles before rendering children.
 * ใช้ครอบหน้า dashboard ที่ต้องการจำกัดสิทธิ์
 *
 * @example
 * <RequireRole roles={["super_admin", "system_admin"]}>
 *   <AdminPanel />
 * </RequireRole>
 */
export default function RequireRole({
  roles,
  children,
  fallback,
}: {
  roles: string[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as Record<string, unknown>)?.roles as string[] ?? [];
  const hasAccess = userRoles.some((r) => roles.includes(r));

  if (!hasAccess) {
    return (
      fallback ?? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#FCE4E8] rounded-full flex items-center justify-center">
              <ShieldOff className="w-8 h-8 text-[#A31D1D]" strokeWidth={2} />
            </div>
            <h2 className="text-lg font-semibold text-[#1A1A2E] mb-1">ไม่มีสิทธิ์เข้าถึง</h2>
            <p className="text-sm text-[#6B7280]">คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบ</p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
