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
    if (q) where.OR = [{ courseCode: { contains: q } }, { nameTh: { contains: q } }, { nameEn: { contains: q } }];

    const [data, total] = await Promise.all([
      prisma.academicCourse.findMany({ where: where as any, skip, take: limit, orderBy: { courseCode: "asc" } }),
      prisma.academicCourse.count({ where: where as any }),
    ]);
    return success(data, { total, page, limit });
  } catch { return error("INTERNAL", "ไม่สามารถดึงข้อมูลรายวิชาได้"); }
}
