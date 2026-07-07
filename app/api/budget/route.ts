import { NextRequest } from "next/server";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

// TODO: Replace with prisma.erpPurchaseRequest when budget models are added to schema

const mockBudgetItems = [
  { id: 1, fiscalYear: 2569, department: "คณะนิติศาสตร์", category: "งบบุคลากร", allocated: 5000000, spent: 3200000, remaining: 1800000, status: "active" },
  { id: 2, fiscalYear: 2569, department: "คณะนิติศาสตร์", category: "งบดำเนินงาน", allocated: 3000000, spent: 1500000, remaining: 1500000, status: "active" },
  { id: 3, fiscalYear: 2569, department: "คณะนิติศาสตร์", category: "งบลงทุน", allocated: 2000000, spent: 800000, remaining: 1200000, status: "active" },
];

const mockRequests: unknown[] = [];

export async function GET(req: NextRequest) {
  await requireAuth();
  try {
    const { page, limit, skip } = parsePagination(req);
    const url = new URL(req.url);
    const fiscalYear = url.searchParams.get("fiscalYear");

    let data = [...mockBudgetItems];
    if (fiscalYear) data = data.filter((b) => b.fiscalYear === parseInt(fiscalYear));

    const total = data.length;
    data = data.slice(skip, skip + limit);
    return success(data, { total, page, limit });
  } catch (e) {
    return error("INTERNAL", "ไม่สามารถดึงข้อมูลงบประมาณได้");
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  try {
    const body = await req.json();
    const { title, amount, reason } = body;

    if (!title || !amount) {
      return error("VALIDATION", "กรุณากรอกข้อมูลให้ครบถ้วน");
    }

    const request = { id: Date.now(), title, amount, reason, status: "pending", requesterId: user.id, createdAt: new Date().toISOString() };
    mockRequests.push(request);
    return success(request);
  } catch (e) {
    return error("INTERNAL", "ไม่สามารถส่งคำของบประมาณได้");
  }
}
