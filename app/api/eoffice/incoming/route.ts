import { NextRequest } from "next/server";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

const INCOMING = [
  { id: "in-1", docNo: "รับ 001/2569", title: "ขอเชิญร่วมงานวันสถาปนาคณะ", senderName: "สำนักอธิการบดี", receivedDate: "2569-07-05", status: "received", secretLevel: "ปกติ", urgentLevel: "ปกติ", departmentName: "ฝ่ายบริหาร" },
  { id: "in-2", docNo: "รับ 002/2569", title: "แจ้งผลการประเมินหลักสูตร", senderName: "สภามหาวิทยาลัย", receivedDate: "2569-06-20", status: "processed", secretLevel: "ปกติ", urgentLevel: "ด่วน", departmentName: "ฝ่ายวิชาการ" },
  { id: "in-3", docNo: "รับ 003/2569", title: "ขอข้อมูลบุคลากรเพื่อตรวจสอบ", senderName: "กรมบัญชีกลาง", receivedDate: "2569-06-15", status: "pending", secretLevel: "ลับ", urgentLevel: "ปกติ", departmentName: "งานบุคคล" },
];

export async function GET(req: NextRequest) {
  await requireAuth();
  try {
    const { page, limit } = parsePagination(req);
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const q = url.searchParams.get("q") ?? "";
    let filtered = INCOMING;
    if (status) filtered = filtered.filter(d => d.status === status);
    if (q) filtered = filtered.filter(d => d.title.includes(q) || d.docNo.includes(q));
    const start = ((page || 1) - 1) * (limit || 20);
    return success(filtered.slice(start, start + (limit || 20)), { total: filtered.length, page: page || 1, limit: limit || 20 });
  } catch { return error("INTERNAL", "ไม่สามารถดึงข้อมูลหนังสือเข้าได้"); }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  try {
    const body = await req.json();
    return success({ id: `in-${Date.now()}`, ...body, receivedDate: new Date().toISOString(), status: "received" });
  } catch { return error("INTERNAL", "ไม่สามารถบันทึกหนังสือเข้าได้"); }
}
