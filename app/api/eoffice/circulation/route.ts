import { NextRequest } from "next/server";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

const CIRCULATIONS = [
  { id: "circ-1", title: "บันทึกข้อความ เรื่อง แนวปฏิบัติการลา", senderName: "ฝ่ายบริหาร", departmentName: "คณะนิติศาสตร์", secretLevel: "ปกติ", urgentLevel: "ปกติ", status: "active", createdAt: "2569-07-01", recipients: [{ id: "r1", name: "สมชาย ใจดี", department: "ฝ่ายวิชาการ", isRead: true, isAcknowledged: true }, { id: "r2", name: "ปรีชา วิชาการ", department: "ฝ่าย IT", isRead: true, isAcknowledged: false }] },
  { id: "circ-2", title: "ประกาศ วันหยุดเพิ่มเติมเดือนสิงหาคม", senderName: "งานบุคคล", departmentName: "คณะนิติศาสตร์", secretLevel: "ปกติ", urgentLevel: "ด่วน", status: "active", createdAt: "2569-06-28", recipients: [{ id: "r3", name: "ธนา กฎหมาย", department: "ฝ่ายวิชาการ", isRead: false, isAcknowledged: false }] },
];

export async function GET(req: NextRequest) {
  await requireAuth();
  try {
    const { page, limit } = parsePagination(req);
    const start = ((page || 1) - 1) * (limit || 20);
    return success(CIRCULATIONS.slice(start, start + (limit || 20)), { total: CIRCULATIONS.length, page: page || 1, limit: limit || 20 });
  } catch { return error("INTERNAL", "ไม่สามารถดึงข้อมูลหนังสือเวียนได้"); }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  try {
    const body = await req.json();
    return success({ id: `circ-${Date.now()}`, ...body, createdAt: new Date().toISOString(), recipients: [] });
  } catch { return error("INTERNAL", "ไม่สามารถสร้างหนังสือเวียนได้"); }
}
