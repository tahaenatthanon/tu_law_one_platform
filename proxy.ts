import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/** Secret key for JWT verification */
const SECRET = process.env.NEXTAUTH_SECRET || "tulaw-one-platform-fallback-secret-do-not-use-in-real-prod";

/** Roles with full admin access */
const ADMIN_ROLES = ["super_admin", "system_admin"];

/** Public paths — ไม่ต้อง login */
const PUBLIC_PATHS = [
  "/login",
  "/api/auth",
  "/_next",
  "/favicon.ico",
];

/** Admin-only API prefixes */
const ADMIN_API_PREFIXES = [
  "/api/stats",
];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

async function getTokenOrNull(request: NextRequest) {
  return getToken({ req: request, secret: SECRET });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Public paths → pass through
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // 2. Admin-only API routes → require admin role
  if (ADMIN_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    const token = await getTokenOrNull(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "กรุณาเข้าสู่ระบบก่อนใช้งาน API" } },
        { status: 401 }
      );
    }
    const roles: string[] = token.roles as string[] ?? [];
    if (!roles.some((r) => ADMIN_ROLES.includes(r))) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้" } },
        { status: 403 }
      );
    }
    return NextResponse.next();
  }

  // 3. Other API routes → must be authenticated
  if (pathname.startsWith("/api/")) {
    const token = await getTokenOrNull(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "กรุณาเข้าสู่ระบบก่อนใช้งาน API" } },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // 4. Admin-only dashboard pages → redirect to dashboard if not admin
  if (pathname.startsWith("/dashboard/admin")) {
    const token = await getTokenOrNull(request);
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    const roles: string[] = token.roles as string[] ?? [];
    if (!roles.some((r) => ADMIN_ROLES.includes(r))) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 5. Dashboard pages → redirect to login if no token
  if (pathname.startsWith("/dashboard")) {
    const token = await getTokenOrNull(request);
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 6. Everything else → pass through
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
