import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // No token → redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/announcements/:path*",
    "/api/stats/:path*",
    "/api/budget/:path*",
    "/api/eoffice/:path*",
    "/api/evaluation/:path*",
    "/api/helpdesk/:path*",
    "/api/internship/:path*",
    "/api/leave/:path*",
    "/api/library/:path*",
    "/api/purchasing/:path*",
    "/api/room-booking/:path*",
    "/api/salary/:path*",
    "/api/syllabus/:path*",
    "/api/vehicle-booking/:path*",
    "/api/academic/:path*",
    "/api/erp/:path*",
    "/api/hr/:path*",
    "/api/storage/:path*",
  ],
};
