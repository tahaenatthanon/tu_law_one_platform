import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const user = await requireAuth().catch((e) => { throw e; });
  try {
    const { page, limit, skip } = parsePagination(req);
    const url = new URL(req.url);
    const type = url.searchParams.get("type"); // pr | po
    const status = url.searchParams.get("status");

    if (type === "po") {
      const wherePo: Record<string, unknown> = {};
      if (status) wherePo.status = status;
      const [data, total] = await Promise.all([
        prisma.erpPurchaseOrder.findMany({ where: wherePo, include: { vendor: true, items: true }, skip, take: limit, orderBy: { createdAt: "desc" } }),
        prisma.erpPurchaseOrder.count({ where: wherePo }),
      ]);
      return success(data, { total, page, limit });
    }

    const where: Record<string, unknown> = { requesterUserId: user.id };
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.erpPurchaseRequest.findMany({ where, include: { items: true }, skip, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.erpPurchaseRequest.count({ where }),
    ]);
    return success(data, { total, page, limit });
  } catch (e) {
    return error("INTERNAL", "ไม่สามารถดึงข้อมูลจัดซื้อได้");
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth().catch((e) => { throw e; });
  try {
    const body = await req.json();
    const { items } = body;

    if (!items || !items.length) {
      return error("VALIDATION", "กรุณากรอกรายการขอซื้อ");
    }

    const prNo = `PR-${Date.now().toString(36).toUpperCase()}`;
    const totalAmount = items.reduce((sum: number, item: { unitPrice: number; quantity: number }) => sum + item.unitPrice * item.quantity, 0);

    const pr = await prisma.erpPurchaseRequest.create({
      data: {
        prNo, requesterUserId: user.id, totalAmount, status: "draft", createdBy: user.id,
        items: { create: items.map((item: { itemName: string; quantity: number; unitPrice: number }) => ({ itemName: item.itemName, quantity: item.quantity, unitPrice: item.unitPrice, createdBy: user.id })) },
      },
      include: { items: true },
    });
    return success(pr);
  } catch (e) {
    return error("INTERNAL", "ไม่สามารถสร้างใบขอซื้อได้");
  }
}
