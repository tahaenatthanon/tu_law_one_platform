import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Allow the request to proceed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token }) {
        // If token exists, user is authenticated
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Protect dashboard pages and API routes (except auth)
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
