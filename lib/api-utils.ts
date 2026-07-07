import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
  meta?: { total: number; page: number; limit: number };
};

export function success<T>(data: T, meta?: ApiResponse["meta"]) {
  return NextResponse.json({ success: true, data, ...(meta ? { meta } : {}) });
}

export function error(code: string, message: string, status = 400) {
  return NextResponse.json({ success: false, error: { code, message } }, { status });
}

export async function getAuthUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session.user as { id: string; email: string; name: string; roles: string[] };
}

export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) {
    throw NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "กรุณาเข้าสู่ระบบ" } },
      { status: 401 }
    );
  }
  return user;
}

/**
 * requireRole — ตรวจสอบว่าผู้ใช้มี role อย่างน้อยหนึ่งใน roles ที่ระบุ
 * ใช้ใน API Route: const user = await requireRole(["super_admin", "system_admin"]);
 */
export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth();
  const hasRole = user.roles.some((r) => allowedRoles.includes(r));
  if (!hasRole) {
    throw NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้" } },
      { status: 403 }
    );
  }
  return user;
}

export function parsePagination(req: NextRequest) {
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "20")));
  return { page, limit, skip: (page - 1) * limit };
}
