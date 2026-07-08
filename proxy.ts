import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * proxy.ts — Next.js 16 Proxy (Node.js runtime)
 * Auth gating สำหรับ next-auth v4 — แทน middleware.ts (deprecated)
 *
 * Public routes: /login, /api/auth/*
 * Protected: ทุกอย่างอื่น
 * Role check: ทำใน layout/page โดยตรง
 */
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;

    // ─── Admin-only paths — ต้องมี role ที่เหมาะสม ───
    const adminPaths = ["/dashboard/admin", "/dashboard/system-settings", "/dashboard/audit-log", "/dashboard/users"];
    const isAdminPath = adminPaths.some((p) => pathname.startsWith(p));

    if (isAdminPath && req.nextauth.token) {
      const roles: string[] = (req.nextauth.token.roles as string[]) ?? [];
      const adminRoles = ["super_admin", "system_admin"];
      const hasAccess = roles.some((r) => adminRoles.includes(r));
      if (!hasAccess) {
        return NextResponse.redirect(new URL("/dashboard?error=forbidden", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token }) {
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

/**
 * Matcher config — ระบุ paths ที่ proxy จะทำงาน
 */
export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|css|js|ico)).*)"],
};
