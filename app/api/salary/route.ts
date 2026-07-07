import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const user = await requireAuth();
  try {
    const { page, limit, skip } = parsePagination(req);
    const url = new URL(req.url);
    const payPeriod = url.searchParams.get("payPeriod");

    const where: Record<string, unknown> = { userId: user.id };
    if (payPeriod) where.payPeriod = payPeriod;

    const [data, total] = await Promise.all([
      prisma.hrPayslip.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.hrPayslip.count({ where }),
    ]);
    return success(data, { total, page, limit });
  } catch (e) {
    return error("INTERNAL", "ไม่สามารถดึงข้อมูลเงินเดือนได้");
  }
}
