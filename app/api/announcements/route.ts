import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  await requireAuth();
  try {
    const { page, limit, skip } = parsePagination(req);
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const categoryId = url.searchParams.get("categoryId");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = parseInt(categoryId);

    const [data, total] = await Promise.all([
      prisma.announcement.findMany({ where, include: { category: true }, skip, take: limit, orderBy: { publishDate: "desc" } }),
      prisma.announcement.count({ where }),
    ]);
    return success(data, { total, page, limit });
  } catch {
    return error("INTERNAL", "ไม่สามารถดึงข้อมูลประกาศได้");
  }
}
