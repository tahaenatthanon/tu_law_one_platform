import { NextRequest } from "next/server";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

const BUDGET = [
  { id: "bi-1", name: "งบบุคลากร", category: "เงินเดือน", allocatedAmount: 1000000, usedAmount: 800000, fiscalYear: 2569, departmentName: "คณะนิติศาสตร์" },
  { id: "bi-2", name: "งบดำเนินงาน", category: "ดำเนินงาน", allocatedAmount: 800000, usedAmount: 600000, fiscalYear: 2569, departmentName: "คณะนิติศาสตร์" },
  { id: "bi-3", name: "งบลงทุน", category: "ลงทุน", allocatedAmount: 500000, usedAmount: 300000, fiscalYear: 2569, departmentName: "คณะนิติศาสตร์" },
];

export async function GET(req: NextRequest) {
  await requireAuth();
  try {
    const { page, limit } = parsePagination(req);
    const category = new URL(req.url).searchParams.get("category");
    const filtered = category ? BUDGET.filter(b => b.category === category) : BUDGET;
    const total = filtered.length;
    const start = ((page || 1) - 1) * (limit || 20);
    return success(filtered.slice(start, start + (limit || 20)), { total, page: page || 1, limit: limit || 20 });
  } catch { return error("INTERNAL", "ไม่สามารถดึงข้อมูลงบประมาณ ERP ได้"); }
}
