import { NextRequest } from "next/server";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

/**
 * Attendance API — returns clock-in/out records for the current user.
 */
export async function GET(req: NextRequest) {
  const user = await requireAuth();
  try {
    const { page, limit } = parsePagination(req);
    const url = new URL(req.url);
    const date = url.searchParams.get("date");

    // Seeded attendance records for this month
    const today = new Date();
    const records = [
      { id: "att-001", userId: user.id, userName: "คุณ", department: "คณะนิติศาสตร์", date: `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`, clockIn: "08:30", clockOut: "17:00", workHours: 8.5, lateMinutes: 0, status: "present" },
      { id: "att-002", userId: user.id, userName: "คุณ", department: "คณะนิติศาสตร์", date: `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()-1).padStart(2,"0")}`, clockIn: "08:45", clockOut: "17:15", workHours: 8.5, lateMinutes: 15, status: "late" },
      { id: "att-003", userId: user.id, userName: "คุณ", department: "คณะนิติศาสตร์", date: `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()-2).padStart(2,"0")}`, clockIn: "08:15", clockOut: "16:45", workHours: 8.5, lateMinutes: 0, status: "present" },
      { id: "att-004", userId: user.id, userName: "คุณ", department: "คณะนิติศาสตร์", date: `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()-3).padStart(2,"0")}`, clockIn: "09:10", clockOut: "17:00", workHours: 7.8, lateMinutes: 40, status: "late" },
      { id: "att-005", userId: user.id, userName: "คุณ", department: "คณะนิติศาสตร์", date: `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()-4).padStart(2,"0")}`, clockIn: "—", clockOut: "—", workHours: 0, lateMinutes: 0, status: "absent" },
    ];

    const filtered = date ? records.filter(r => r.date === date) : records;
    const total = filtered.length;
    const start = ((page || 1) - 1) * (limit || 20);
    return success(filtered.slice(start, start + (limit || 20)), { total, page: page || 1, limit: limit || 20 });
  } catch { return error("INTERNAL", "ไม่สามารถดึงข้อมูลเวลาเข้า-ออกได้"); }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  try {
    const body = await req.json();
    const { type } = body;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    const record = {
      id: `att-${Date.now()}`,
      userId: user.id,
      userName: "คุณ",
      department: "คณะนิติศาสตร์",
      date: now.toISOString().split("T")[0],
      clockIn: type === "clock_in" ? time : "—",
      clockOut: type === "clock_out" ? time : null,
      workHours: 0,
      lateMinutes: time > "09:00" && type === "clock_in" ? Math.round((parseInt(time.split(":")[0]) - 9) * 60 + parseInt(time.split(":")[1])) : 0,
      status: time > "09:00" && type === "clock_in" ? "late" : "present",
    };
    return success(record);
  } catch {
    return error("INTERNAL", "ไม่สามารถบันทึกเวลาได้");
  }
}
