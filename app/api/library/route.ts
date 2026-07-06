import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  await requireAuth().catch((e) => { throw e; });
  try {
    const { page, limit, skip } = parsePagination(req);
    const url = new URL(req.url);
    const q = url.searchParams.get("q") ?? "";
    const type = url.searchParams.get("type");
    const category = url.searchParams.get("category");

    const where: Record<string, unknown> = { isActive: true };
    if (q) where.OR = [{ title: { contains: q, mode: "insensitive" } }, { author: { contains: q, mode: "insensitive" } }, { barcode: { contains: q, mode: "insensitive" } }];
    if (type) where.resourceType = type;
    if (category) where.category = category;

    const [data, total] = await Promise.all([
      prisma.libraryResource.findMany({ where, skip, take: limit, orderBy: { title: "asc" } }),
      prisma.libraryResource.count({ where }),
    ]);
    return success(data, { total, page, limit });
  } catch (e) {
    return error("INTERNAL", "ไม่สามารถสืบค้นทรัพยากรได้");
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth().catch((e) => { throw e; });
  try {
    const body = await req.json();
    const action = body.action;

    if (action === "borrow") {
      const { resourceId } = body;
      if (!resourceId) return error("VALIDATION", "กรุณาระบุทรัพยากร");
      const resource = await prisma.libraryResource.findUnique({ where: { id: resourceId } });
      if (!resource || resource.availableCopies < 1) return error("UNAVAILABLE", "ทรัพยากรไม่พร้อมให้ยืม");

      const [borrowing] = await prisma.$transaction([
        prisma.libraryBorrowing.create({
          data: { resourceId, userId: user.id, borrowDate: new Date(), dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), status: "borrowed", createdBy: user.id },
        }),
        prisma.libraryResource.update({ where: { id: resourceId }, data: { availableCopies: { decrement: 1 } } }),
      ]);
      return success(borrowing);
    }

    if (action === "return") {
      const { borrowingId } = body;
      if (!borrowingId) return error("VALIDATION", "กรุณาระบุรหัสการยืม");
      const borrowing = await prisma.libraryBorrowing.findUnique({ where: { id: borrowingId } });
      if (!borrowing || borrowing.status === "returned") return error("INVALID", "รายการยืมไม่ถูกต้องหรือคืนแล้ว");

      const [updated] = await prisma.$transaction([
        prisma.libraryBorrowing.update({ where: { id: borrowingId }, data: { status: "returned", returnDate: new Date(), updatedBy: user.id } }),
        prisma.libraryResource.update({ where: { id: borrowing.resourceId }, data: { availableCopies: { increment: 1 } } }),
      ]);
      return success(updated);
    }

    if (action === "reserve") {
      const { resourceId } = body;
      if (!resourceId) return error("VALIDATION", "กรุณาระบุทรัพยากร");
      const reservation = await prisma.libraryReservation.create({
        data: { resourceId, userId: user.id, reserveDate: new Date(), status: "pending", createdBy: user.id },
      });
      return success(reservation);
    }

    return error("VALIDATION", "ไม่รู้จัก action ที่ระบุ");
  } catch (e) {
    return error("INTERNAL", "ไม่สามารถดำเนินการได้");
  }
}
