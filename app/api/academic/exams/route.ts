import { NextRequest } from "next/server";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  await requireAuth();
  try {
    const { page, limit } = parsePagination(req);
    const examType = new URL(req.url).searchParams.get("examType");

    const exams = [
      { id: "ex-1", courseName: "น.101 กฎหมายแพ่ง: หลักทั่วไป", examType: "กลางภาค", examDate: "2569-08-15", startTime: "09:00", endTime: "12:00", roomCode: "ห้อง 301", supervisorName: "สมชาย ใจดี", studentCount: 180 },
      { id: "ex-2", courseName: "น.102 กฎหมายอาญา: ภาคทั่วไป", examType: "กลางภาค", examDate: "2569-08-18", startTime: "13:00", endTime: "16:00", roomCode: "ห้อง 302", supervisorName: "ปรีชา วิชาการ", studentCount: 175 },
      { id: "ex-3", courseName: "น.201 กฎหมายรัฐธรรมนูญ", examType: "ปลายภาค", examDate: "2569-10-05", startTime: "09:00", endTime: "12:00", roomCode: "หอประชุม", supervisorName: "ธนา กฎหมาย", studentCount: 220 },
      { id: "ex-4", courseName: "น.301 กฎหมายระหว่างประเทศ", examType: "ปลายภาค", examDate: "2569-10-08", startTime: "13:00", endTime: "16:00", roomCode: "ห้อง 501", supervisorName: "วิชัย นักกฎหมาย", studentCount: 120 },
    ];

    const filtered = examType ? exams.filter(e => e.examType === examType) : exams;
    const total = filtered.length;
    const start = ((page || 1) - 1) * (limit || 20);
    return success(filtered.slice(start, start + (limit || 20)), { total, page: page || 1, limit: limit || 20 });
  } catch { return error("INTERNAL", "ไม่สามารถดึงข้อมูลตารางสอบได้"); }
}
