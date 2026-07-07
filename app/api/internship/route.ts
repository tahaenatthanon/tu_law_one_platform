import { NextRequest } from "next/server";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

// TODO: Replace with prisma.internshipCompany / prisma.internshipReport when models are added

const mockCompanies = [
  { id: 1, name: "สำนักงานกฎหมาย ธรรมศาสตร์และเพื่อน", address: "กรุงเทพฯ", contactPerson: "คุณสมชาย", phone: "02-123-4567", isActive: true },
  { id: 2, name: "ศาลอาญากรุงเทพใต้", address: "กรุงเทพฯ", contactPerson: "คุณสมหญิง", phone: "02-765-4321", isActive: true },
];

const mockReports: unknown[] = [];

export async function GET(req: NextRequest) {
  await requireAuth();
  try {
    const { page, limit, skip } = parsePagination(req);
    const url = new URL(req.url);
    const type = url.searchParams.get("type");

    if (type === "reports") {
      const total = mockReports.length;
      const data = mockReports.slice(skip, skip + limit);
      return success(data, { total, page, limit });
    }

    const data = mockCompanies.filter((c) => c.isActive).slice(skip, skip + limit);
    const total = mockCompanies.filter((c) => c.isActive).length;
    return success(data, { total, page, limit });
  } catch (e) {
    return error("INTERNAL", "ไม่สามารถดึงข้อมูลฝึกงานได้");
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  try {
    const body = await req.json();
    const { companyId, startDate, endDate, reportTitle, reportContent } = body;

    if (!companyId || !startDate || !endDate || !reportTitle) {
      return error("VALIDATION", "กรุณากรอกข้อมูลให้ครบถ้วน");
    }

    const report = { id: Date.now(), companyId, studentUserId: user.id, startDate, endDate, reportTitle, reportContent, status: "submitted", createdAt: new Date().toISOString() };
    mockReports.push(report);
    return success(report);
  } catch (e) {
    return error("INTERNAL", "ไม่สามารถส่งรายงานได้");
  }
}
