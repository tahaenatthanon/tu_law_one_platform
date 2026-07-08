import { NextRequest } from "next/server";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

const OUTGOING = [
  { id: "out-1", docNo: "ออก 001/2569", title: "ขออนุมัติงบประมาณโครงการพัฒนาระบบ", sentDate: "2569-07-01", receiverName: "สำนักอธิการบดี", receiverOrg: "มหาวิทยาลัยธรรมศาสตร์", status: "sent", secretLevel: "ปกติ", urgentLevel: "ปกติ", departmentName: "ฝ่าย IT", creatorName: "สมชาย ใจดี" },
  { id: "out-2", docNo: "ออก 002/2569", title: "รายงานผลการดำเนินงานไตรมาส 2", sentDate: "2569-06-15", receiverName: "สภามหาวิทยาลัย", receiverOrg: "มหาวิทยาลัยธรรมศาสตร์", status: "draft", secretLevel: "ปกติ", urgentLevel: "ปกติ", departmentName: "ฝ่ายบริหาร", creatorName: "คณบดี" },
  { id: "out-3", docNo: "ออก 003/2569", title: "ขอความอนุเคราะห์วิทยากร", sentDate: "2569-06-10", receiverName: "ศาลฎีกา", receiverOrg: "สำนักงานศาลยุติธรรม", status: "sent", secretLevel: "ปกติ", urgentLevel: "ด่วน", departmentName: "ฝ่ายวิชาการ", creatorName: "ปรีชา วิชาการ" },
];

export async function GET(req: NextRequest) {
  await requireAuth();
  try {
    const { page, limit } = parsePagination(req);
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const q = url.searchParams.get("q") ?? "";
    let filtered = OUTGOING;
    if (status) filtered = filtered.filter(d => d.status === status);
    if (q) filtered = filtered.filter(d => d.title.includes(q) || d.docNo.includes(q));
    const start = ((page || 1) - 1) * (limit || 20);
    return success(filtered.slice(start, start + (limit || 20)), { total: filtered.length, page: page || 1, limit: limit || 20 });
  } catch { return error("INTERNAL", "ไม่สามารถดึงข้อมูลหนังสือออกได้"); }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  try {
    const body = await req.json();
    return success({ id: `out-${Date.now()}`, ...body, sentDate: new Date().toISOString(), status: "draft" });
  } catch { return error("INTERNAL", "ไม่สามารถบันทึกหนังสือออกได้"); }
}
