import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const user = await requireAuth().catch((e) => { throw e; });
  try {
    const { page, limit, skip } = parsePagination(req);
    const url = new URL(req.url);
    const evalYear = url.searchParams.get("evalYear");

    const where: Record<string, unknown> = { userId: user.id };
    if (evalYear) where.evalYear = parseInt(evalYear);

    const [data, total] = await Promise.all([
      prisma.hrPerformanceEvaluation.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.hrPerformanceEvaluation.count({ where }),
    ]);
    return success(data, { total, page, limit });
  } catch (e) {
    return error("INTERNAL", "ไม่สามารถดึงข้อมูลการประเมินได้");
  }
}
