import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const user = await requireAuth().catch((e) => { throw e; });
  try {
    const { page, limit, skip } = parsePagination(req);
    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    const where: Record<string, unknown> = { userId: user.id };
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.hrLeaveRequest.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.hrLeaveRequest.count({ where }),
    ]);
    return success(data, { total, page, limit });
  } catch (e) {
    return error("INTERNAL", "ไม่สามารถดึงข้อมูลการลาได้");
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth().catch((e) => { throw e; });
  try {
    const body = await req.json();
    const { leaveType, reason, startDate, endDate } = body;

    if (!leaveType || !startDate || !endDate) {
      return error("VALIDATION", "กรุณากรอกข้อมูลให้ครบถ้วน");
    }

    const leave = await prisma.hrLeaveRequest.create({
      data: { userId: user.id, leaveType, reason, startDate: new Date(startDate), endDate: new Date(endDate), status: "pending", createdBy: user.id },
    });
    return success(leave);
  } catch (e) {
    return error("INTERNAL", "ไม่สามารถยื่นคำขอลาได้");
  }
}
