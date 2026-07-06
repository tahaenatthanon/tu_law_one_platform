import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  await requireAuth().catch((e) => { throw e; });
  try {
    const { page, limit, skip } = parsePagination(req);
    const url = new URL(req.url);
    const fiscalYear = url.searchParams.get("fiscalYear");
    const departmentId = url.searchParams.get("departmentId");

    const where: Record<string, unknown> = {};
    if (fiscalYear) where.fiscalYear = parseInt(fiscalYear);
    if (departmentId) where.departmentId = parseInt(departmentId);

    const [data, total] = await Promise.all([
      prisma.erpBudget.findMany({ where, skip, take: limit, orderBy: { fiscalYear: "desc" } }),
      prisma.erpBudget.count({ where }),
    ]);
    return success(data, { total, page, limit });
  } catch (e) {
    return error("INTERNAL", "ไม่สามารถดึงข้อมูลงบประมาณได้");
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth().catch((e) => { throw e; });
  try {
    const body = await req.json();
    const { budgetId, title, amount, reason } = body;

    if (!budgetId || !title || !amount) {
      return error("VALIDATION", "กรุณากรอกข้อมูลให้ครบถ้วน");
    }

    const request = await prisma.erpBudgetRequest.create({
      data: { budgetId, requesterId: user.id, title, amount, reason, status: "pending", createdBy: user.id },
    });
    return success(request);
  } catch (e) {
    return error("INTERNAL", "ไม่สามารถส่งคำของบประมาณได้");
  }
}
