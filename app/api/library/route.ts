import { NextRequest } from "next/server";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

// TODO: Replace with prisma.libraryResource/Borrowing/Reservation when models are added

const mockResources = [
  { id: 1, title: "ประมวลกฎหมายแพ่งและพาณิชย์ ฉบับสมบูรณ์", author: "สำนักพิมพ์ธรรมศาสตร์", resourceType: "book", category: "กฎหมาย", barcode: "BK-001", availableCopies: 5, totalCopies: 5, isActive: true },
  { id: 2, title: "กฎหมายรัฐธรรมนูญและสถาบันการเมือง", author: "รศ.ดร.สมชาย ใจดี", resourceType: "book", category: "กฎหมาย", barcode: "BK-002", availableCopies: 3, totalCopies: 5, isActive: true },
  { id: 3, title: "วารสารนิติศาสตร์ ปีที่ 50", author: "คณะนิติศาสตร์ มธ.", resourceType: "journal", category: "วารสาร", barcode: "JN-001", availableCopies: 2, totalCopies: 2, isActive: true },
];

const mockBorrowings: unknown[] = [];
const mockReservations: unknown[] = [];

export async function GET(req: NextRequest) {
  await requireAuth();
  try {
    const { page, limit, skip } = parsePagination(req);
    const url = new URL(req.url);
    const q = url.searchParams.get("q") ?? "";
    const type = url.searchParams.get("type");
    const category = url.searchParams.get("category");

    let data = mockResources.filter((r) => r.isActive);
    if (q) { const lq = q.toLowerCase(); data = data.filter((r) => r.title.toLowerCase().includes(lq) || r.author.toLowerCase().includes(lq) || r.barcode.includes(q)); }
    if (type) data = data.filter((r) => r.resourceType === type);
    if (category) data = data.filter((r) => r.category === category);

    const total = data.length;
    data = data.slice(skip, skip + limit);
    return success(data, { total, page, limit });
  } catch (e) {
    return error("INTERNAL", "ไม่สามารถสืบค้นทรัพยากรได้");
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  try {
    const body = await req.json();
    const action = body.action;

    if (action === "borrow") {
      const { resourceId } = body;
      if (!resourceId) return error("VALIDATION", "กรุณาระบุทรัพยากร");
      const resource = mockResources.find((r) => r.id === resourceId);
      if (!resource || resource.availableCopies < 1) return error("UNAVAILABLE", "ทรัพยากรไม่พร้อมให้ยืม");

      resource.availableCopies -= 1;
      const borrowing = { id: Date.now(), resourceId, userId: user.id, borrowDate: new Date().toISOString(), dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), status: "borrowed" };
      mockBorrowings.push(borrowing);
      return success(borrowing);
    }

    if (action === "return") {
      const { borrowingId } = body;
      if (!borrowingId) return error("VALIDATION", "กรุณาระบุรหัสการยืม");
      const idx = mockBorrowings.findIndex((b: any) => b.id === borrowingId);
      if (idx === -1 || (mockBorrowings[idx] as any).status === "returned") return error("INVALID", "รายการยืมไม่ถูกต้องหรือคืนแล้ว");

      (mockBorrowings[idx] as any).status = "returned";
      (mockBorrowings[idx] as any).returnDate = new Date().toISOString();
      const resource = mockResources.find((r) => r.id === (mockBorrowings[idx] as any).resourceId);
      if (resource) resource.availableCopies += 1;
      return success(mockBorrowings[idx]);
    }

    if (action === "reserve") {
      const { resourceId } = body;
      if (!resourceId) return error("VALIDATION", "กรุณาระบุทรัพยากร");
      const reservation = { id: Date.now(), resourceId, userId: user.id, reserveDate: new Date().toISOString(), status: "pending" };
      mockReservations.push(reservation);
      return success(reservation);
    }

    return error("VALIDATION", "ไม่รู้จัก action ที่ระบุ");
  } catch (e) {
    return error("INTERNAL", "ไม่สามารถดำเนินการได้");
  }
}
