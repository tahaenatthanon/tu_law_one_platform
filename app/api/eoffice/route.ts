import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const user = await requireAuth().catch((e) => { throw e; });
  try {
    const { page, limit, skip } = parsePagination(req);
    const url = new URL(req.url);
    const type = url.searchParams.get("type"); // inbox | sent | all
    const status = url.searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    if (type === "inbox") {
      where.routings = { some: { receiverUserId: user.id } };
    } else if (type === "sent") {
      where.createdBy = user.id;
    }

    const [data, total] = await Promise.all([
      prisma.eofficeDocument.findMany({
        where,
        include: {
          senderDepartment: true,
          routings: { include: { sender: { select: { firstNameTh: true, lastNameTh: true } }, receiver: { select: { firstNameTh: true, lastNameTh: true } } }, orderBy: { createdAt: "desc" } },
          signatures: true,
        },
        skip, take: limit, orderBy: { createdAt: "desc" },
      }),
      prisma.eofficeDocument.count({ where }),
    ]);
    return success(data, { total, page, limit });
  } catch (e) {
    return error("INTERNAL", "ไม่สามารถดึงข้อมูลหนังสือได้");
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth().catch((e) => { throw e; });
  try {
    const body = await req.json();
    const { title, secretLevel, urgentLevel, senderDepartmentId, receiverUserId, remark } = body;

    if (!title || !senderDepartmentId || !receiverUserId) {
      return error("VALIDATION", "กรุณากรอกข้อมูลให้ครบถ้วน");
    }

    const docNo = `DOC-${Date.now().toString(36).toUpperCase()}`;
    const doc = await prisma.eofficeDocument.create({
      data: {
        docNo, title,
        secretLevel: secretLevel ?? "normal",
        urgentLevel: urgentLevel ?? "normal",
        senderDepartmentId, status: "sent", createdBy: user.id,
        routings: {
          create: {
            senderUserId: user.id, receiverUserId,
            actionType: "forward", remark, createdBy: user.id,
          },
        },
      },
      include: {
        senderDepartment: true,
        routings: { include: { sender: { select: { firstNameTh: true, lastNameTh: true } }, receiver: { select: { firstNameTh: true, lastNameTh: true } } } },
      },
    });
    return success(doc);
  } catch (e) {
    return error("INTERNAL", "ไม่สามารถส่งหนังสือได้");
  }
}
