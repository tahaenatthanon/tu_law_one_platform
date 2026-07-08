import { NextRequest } from "next/server";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

const COMPANIES = [
  { id: "cmp-1", name: "บริษัท กฎหมายไทย จำกัด", industry: "กฎหมาย", location: "กรุงเทพมหานคร", contactPhone: "02-123-4567", maxInterns: 5, currentInterns: 3, isActive: true },
  { id: "cmp-2", name: "สำนักงานอัยการสูงสุด", industry: "ราชการ", location: "กรุงเทพมหานคร", contactPhone: "02-222-3333", maxInterns: 10, currentInterns: 7, isActive: true },
  { id: "cmp-3", name: "ศาลแพ่งกรุงเทพใต้", industry: "ศาล", location: "กรุงเทพมหานคร", contactPhone: "02-444-5555", maxInterns: 4, currentInterns: 2, isActive: true },
];

const REPORTS = [
  { id: "rpt-1", company: { name: "บริษัท กฎหมายไทย จำกัด" }, student: { name: "สมชาย ใจดี" }, title: "รายงานฝึกงานสัปดาห์ที่ 1", status: "approved", createdAt: "2569-06-15" },
  { id: "rpt-2", company: { name: "สำนักงานอัยการสูงสุด" }, student: { name: "ปรีชา วิชาการ" }, title: "รายงานฝึกงานสัปดาห์ที่ 1", status: "pending", createdAt: "2569-06-18" },
];

export async function GET(req: NextRequest) {
  await requireAuth();
  try {
    const { page, limit } = parsePagination(req);
    const type = new URL(req.url).searchParams.get("type");
    const data = type === "reports" ? REPORTS : COMPANIES;
    const start = ((page || 1) - 1) * (limit || 20);
    return success(data.slice(start, start + (limit || 20)), { total: data.length, page: page || 1, limit: limit || 20 });
  } catch { return error("INTERNAL", "ไม่สามารถดึงข้อมูลฝึกงานได้"); }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  try {
    const body = await req.json();
    return success({ id: `rpt-${Date.now()}`, ...body, student: { name: "คุณ" }, status: "submitted", createdAt: new Date().toISOString() });
  } catch { return error("INTERNAL", "ไม่สามารถส่งรายงานได้"); }
}
