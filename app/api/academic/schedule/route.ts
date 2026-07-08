import { NextRequest } from "next/server";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  await requireAuth();
  try {
    const { page, limit, skip } = parsePagination(req);
    const url = new URL(req.url);
    const day = url.searchParams.get("day");
    const where: Record<string, unknown> = {};
    if (day) where.studyDay = day;

    const [data, total] = await Promise.all([
      prisma.academicTeachingLoad.findMany({ where: where as any, skip, take: limit, include: { course: true, room: true, user: true }, orderBy: { studyDay: "asc" } }),
      prisma.academicTeachingLoad.count({ where: where as any }),
    ]);
    return success(data, { total, page, limit });
  } catch { return error("INTERNAL", "ไม่สามารถดึงข้อมูลตารางเรียนได้"); }
}
