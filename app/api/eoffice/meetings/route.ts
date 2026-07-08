import { NextRequest } from "next/server";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

const MEETINGS = [
  { id: "mt-1", title: "ประชุมคณะกรรมการประจำคณะ ครั้งที่ 6/2569", agenda: "พิจารณางบประมาณ 2569 · ติดตามผลการดำเนินงาน", meetingDate: "2569-07-10T09:00:00Z", location: "ห้องประชุม 301", organizerName: "คณบดี", status: "scheduled", attendees: [{ id: "a1", name: "สมชาย ใจดี", department: "ฝ่าย IT", isAttended: false, response: "pending" }, { id: "a2", name: "ปรีชา วิชาการ", department: "ฝ่ายวิชาการ", isAttended: false, response: "accepted" }] },
  { id: "mt-2", title: "สัมมนาทางวิชาการ AI กับกฎหมาย", agenda: "บรรยายพิเศษ · Workshop", meetingDate: "2569-07-15T13:00:00Z", location: "ห้องประชุมใหญ่", organizerName: "ฝ่ายวิชาการ", status: "scheduled", attendees: [{ id: "a3", name: "ธนา กฎหมาย", department: "ฝ่ายวิชาการ", isAttended: false, response: "accepted" }] },
  { id: "mt-3", title: "ประชุมหารือโครงการวิจัยประจำปี", agenda: "สรุปความคืบหน้าโครงการ", meetingDate: "2569-06-20T14:00:00Z", location: "ห้อง 201", organizerName: "ฝ่ายวิจัย", status: "completed", attendees: [{ id: "a4", name: "วิชัย นักกฎหมาย", department: "ฝ่ายวิชาการ", isAttended: true, response: "accepted" }], minutesNote: "ที่ประชุมมีมติดำเนินการต่อ" },
];

export async function GET(req: NextRequest) {
  await requireAuth();
  try {
    const { page, limit } = parsePagination(req);
    const status = new URL(req.url).searchParams.get("status");
    const filtered = status ? MEETINGS.filter(m => m.status === status) : MEETINGS;
    const start = ((page || 1) - 1) * (limit || 20);
    return success(filtered.slice(start, start + (limit || 20)), { total: filtered.length, page: page || 1, limit: limit || 20 });
  } catch { return error("INTERNAL", "ไม่สามารถดึงข้อมูลประชุมได้"); }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  try {
    const body = await req.json();
    return success({ id: `mt-${Date.now()}`, ...body, status: "scheduled", attendees: [] });
  } catch { return error("INTERNAL", "ไม่สามารถบันทึกการประชุมได้"); }
}
