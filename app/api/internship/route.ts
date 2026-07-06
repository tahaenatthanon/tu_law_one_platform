import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  await requireAuth().catch((e) => { throw e; });
  try {
    const { page, limit, skip } = parsePagination(req);
    const url = new URL(req.url);
    const type = url.searchParams.get("type"); // companies | reports

    if (type === "reports") {
      const [data, total] = await Promise.all([
        prisma.internshipReport.findMany({ include: { company: true }, skip, take: limit, orderBy: { createdAt: "desc" } }),
        prisma.internshipReport.count(),
      ]);
      return success(data, { total, page, limit });
    }

    const [data, total] = await Promise.all([
      prisma.internshipCompany.findMany({ where: { isActive: true }, skip, take: limit, orderBy: { name: "asc" } }),
      prisma.internshipCompany.count({ where: { isActive: true } }),
    ]);
    return success(data, { total, page, limit });
  } catch (e) {
    return error("INTERNAL", "ไม่สามารถดึงข้อมูลฝึกงานได้");
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth().catch((e) => { throw e; });
  try {
    const body = await req.json();
    const { companyId, startDate, endDate, reportTitle, reportContent } = body;

    if (!companyId || !startDate || !endDate || !reportTitle) {
      return error("VALIDATION", "กรุณากรอกข้อมูลให้ครบถ้วน");
    }

    const report = await prisma.internshipReport.create({
      data: { companyId, studentUserId: user.id, startDate: new Date(startDate), endDate: new Date(endDate), reportTitle, reportContent, status: "submitted", createdBy: user.id },
      include: { company: true },
    });
    return success(report);
  } catch (e) {
    return error("INTERNAL", "ไม่สามารถส่งรายงานได้");
  }
}
