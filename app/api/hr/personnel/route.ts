import { NextRequest } from "next/server";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  await requireAuth();
  try {
    const { page, limit, skip } = parsePagination(req);
    const url = new URL(req.url);
    const q = url.searchParams.get("q") ?? "";

    const where: Record<string, unknown> = {};
    if (q) where.OR = [{ user: { firstNameTh: { contains: q } } }, { user: { lastNameTh: { contains: q } } }, { employeeCode: { contains: q } }];

    const [data, total] = await Promise.all([
      prisma.hrEmployeeProfile.findMany({ where: where as any, skip, take: limit, include: { user: { include: { department: true, userRoles: { include: { role: true } } } } }, orderBy: { user: { firstNameTh: "asc" } } }),
      prisma.hrEmployeeProfile.count({ where: where as any }),
    ]);
    return success(data, { total, page, limit });
  } catch { return error("INTERNAL", "ไม่สามารถดึงข้อมูลบุคลากรได้"); }
}
