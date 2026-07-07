import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const user = await requireAuth();
  try {
    const { page, limit, skip } = parsePagination(req);
    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    const where: Record<string, unknown> = { requesterUserId: user.id };
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.helpdeskTicket.findMany({ where, include: { histories: { orderBy: { createdAt: "desc" } } }, skip, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.helpdeskTicket.count({ where }),
    ]);
    return success(data, { total, page, limit });
  } catch (e) {
    return error("INTERNAL", "ไม่สามารถดึงข้อมูลใบแจ้งปัญหาได้");
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  try {
    const body = await req.json();
    const { title, description, priority, category } = body;

    if (!title) return error("VALIDATION", "กรุณากรอกหัวข้อปัญหา");

    const ticket = await prisma.helpdeskTicket.create({
      data: { requesterUserId: user.id, title, description, priority: priority ?? "medium", category, status: "open", createdBy: user.id },
    });
    return success(ticket);
  } catch (e) {
    return error("INTERNAL", "ไม่สามารถแจ้งปัญหาได้");
  }
}
