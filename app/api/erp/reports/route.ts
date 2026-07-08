import { NextRequest } from "next/server";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

const TEMPLATES = [
  { id: "rpt-1", name: "รายงานงบประมาณประจำเดือน", module: "งบประมาณ", description: "สรุปการใช้จ่ายงบประมาณรายเดือน" },
  { id: "rpt-2", name: "รายงานสินทรัพย์ถาวร", module: "ครุภัณฑ์", description: "ทะเบียนครุภัณฑ์และค่าเสื่อมราคา" },
  { id: "rpt-3", name: "รายงานการเงิน", module: "การเงิน", description: "งบการเงินรายไตรมาส" },
  { id: "rpt-4", name: "รายงานพัสดุคงคลัง", module: "พัสดุ", description: "รายงานสต็อกพัสดุคงเหลือ" },
];

const SCHEDULES = [
  { id: "sch-1", template: { name: "รายงานงบประมาณประจำเดือน" }, scheduleType: "monthly", recipients: "dean@law.tu.ac.th", isActive: true, lastRunAt: "2569-06-30", nextRunAt: "2569-07-31" },
  { id: "sch-2", template: { name: "รายงานสินทรัพย์ถาวร" }, scheduleType: "quarterly", recipients: "admin@law.tu.ac.th", isActive: true, lastRunAt: "2569-06-30", nextRunAt: "2569-09-30" },
];

export async function GET(req: NextRequest) {
  await requireAuth();
  try {
    const { page, limit } = parsePagination(req);
    const type = new URL(req.url).searchParams.get("type");
    const data = type === "schedules" ? SCHEDULES : TEMPLATES;
    const start = ((page || 1) - 1) * (limit || 20);
    return success(data.slice(start, start + (limit || 20)), { total: data.length, page: page || 1, limit: limit || 20 });
  } catch { return error("INTERNAL", "ไม่สามารถดึงข้อมูลรายงานได้"); }
}
