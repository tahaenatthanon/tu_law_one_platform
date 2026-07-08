import { NextRequest } from "next/server";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

const FINANCE: Record<string, { id: string; [key: string]: unknown }[]> = {
  journal: [{ id: "je-1", entryNo: "JV-2569-001", entryDate: "2569-07-01", description: "บันทึกค่าใช้จ่าย", totalDebit: 50000, totalCredit: 50000, status: "posted" }],
  invoice: [{ id: "inv-1", invoiceNo: "INV-2569-001", vendorName: "บจก. เทคโนโลยี", totalAmount: 85000, vatAmount: 5950, status: "pending", createdAt: "2569-06-01" }],
  receipt: [{ id: "rec-1", receiptNo: "REC-2569-001", payerName: "นักศึกษา", totalAmount: 12000, paymentMethod: "โอนเงิน", status: "completed", createdAt: "2569-06-10" }],
  payment: [{ id: "pay-1", paymentNo: "PMT-2569-001", amount: 45000, paymentMethod: "โอนเงิน", referenceNo: "INV-002", status: "completed", createdAt: "2569-06-01" }],
};

export async function GET(req: NextRequest) {
  await requireAuth();
  try {
    const { page, limit } = parsePagination(req);
    const type = new URL(req.url).searchParams.get("type") ?? "journal";
    const data = FINANCE[type] || FINANCE.journal;
    const start = ((page || 1) - 1) * (limit || 20);
    return success(data.slice(start, start + (limit || 20)), { total: data.length, page: page || 1, limit: limit || 20 });
  } catch { return error("INTERNAL", "ไม่สามารถดึงข้อมูลการเงิน ERP ได้"); }
}
