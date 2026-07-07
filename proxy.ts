import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/** Public paths — ไม่ต้อง login */
const PUBLIC_PATHS = [
  "/login",
  "/api/auth",      // NextAuth.js handlers
  "/_next",          // Static files, HMR
  "/favicon.ico",
];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Public paths → pass through
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // 2. API routes (ไม่รวม /api/auth) → ต้องมี token
  if (pathname.startsWith("/api/")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || "tulaw-one-platform-fallback-secret-do-not-use-in-real-prod",
    });

    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "กรุณาเข้าสู่ระบบก่อนใช้งาน API" } },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  // 3. Dashboard pages → redirect to login
  if (pathname.startsWith("/dashboard")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || "tulaw-one-platform-fallback-secret-do-not-use-in-real-prod",
    });

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // 4. Everything else → pass through
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
