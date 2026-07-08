import { NextRequest } from "next/server";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

const BUDGET = [
  { id: "bi-1", name: "งบบุคลากร", budgetType: "เงินเดือน", totalAmount: 1000000, usedAmount: 800000, remainingAmount: 200000, fiscalYear: 2569, departmentId: 1, status: "active" },
  { id: "bi-2", name: "งบดำเนินงาน", budgetType: "ดำเนินงาน", totalAmount: 800000, usedAmount: 600000, remainingAmount: 200000, fiscalYear: 2569, departmentId: 2, status: "active" },
  { id: "bi-3", name: "งบลงทุน", budgetType: "ลงทุน", totalAmount: 500000, usedAmount: 300000, remainingAmount: 200000, fiscalYear: 2569, departmentId: 3, status: "active" },
];

export async function GET(req: NextRequest) {
  await requireAuth();
  try {
    const { page, limit } = parsePagination(req);
    const fiscalYear = new URL(req.url).searchParams.get("fiscalYear");
    const filtered = fiscalYear ? BUDGET.filter(b => b.fiscalYear === parseInt(fiscalYear)) : BUDGET;
    const start = ((page || 1) - 1) * (limit || 20);
    return success(filtered.slice(start, start + (limit || 20)), { total: filtered.length, page: page || 1, limit: limit || 20 });
  } catch { return error("INTERNAL", "ไม่สามารถดึงข้อมูลงบประมาณได้"); }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  try {
    const body = await req.json();
    return success({ id: `bi-${Date.now()}`, ...body, fiscalYear: 2569 });
  } catch { return error("INTERNAL", "ไม่สามารถบันทึกข้อมูลงบประมาณได้"); }
}
