import { NextRequest } from "next/server";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

/**
 * Training API — returns training courses.
 * Uses seeded data; connect to prisma.hrTraining once the model is added to schema.
 */
export async function GET(req: NextRequest) {
  await requireAuth();
  try {
    const { page, limit } = parsePagination(req);
    const url = new URL(req.url);
    const type = url.searchParams.get("type");

    const allTrainings = [
      { id: "tr-001", title: "การใช้งานระบบ TULAW ONE PLATFORM", trainerName: "ทีม IT", location: "ห้องประชุม 301", startDate: "2026-08-01", endDate: "2026-08-01", totalHours: 3, maxAttendees: 30, participants: [], status: "planned", description: "เรียนรู้การใช้งานระบบ TULAW ONE PLATFORM อย่างเต็มประสิทธิภาพ" },
      { id: "tr-002", title: "เทคนิคการสอนกฎหมายด้วยเทคโนโลยี AI", trainerName: "ดร. สมชาย ใจดี", location: "โรงแรมอีสติน แกรนด์", startDate: "2026-09-15", endDate: "2026-09-16", totalHours: 16, maxAttendees: 50, participants: [{ name: "คุณ", status: "registered" }], status: "planned", description: "สัมมนาเชิงปฏิบัติการ AI กับการสอนกฎหมาย" },
      { id: "tr-003", title: "การเขียนข้อเสนอโครงการวิจัย", trainerName: "ศ. ดร. ปรีชา วิชาการ", location: "ห้องสมุดคณะ", startDate: "2026-07-20", endDate: "2026-07-21", totalHours: 16, maxAttendees: 20, participants: [], status: "planned", description: "อบรมการเขียนข้อเสนอโครงการวิจัยให้ได้ทุน" },
      { id: "tr-004", title: "PDPA สำหรับบุคลากร", trainerName: "ผศ. ดร. ธนา กฎหมาย", location: "ออนไลน์ (Zoom)", startDate: "2026-06-01", endDate: "2026-06-01", totalHours: 4, maxAttendees: 100, participants: [{ name: "คุณ", status: "completed", score: 85 }], status: "completed", description: "อบรมกฎหมายคุ้มครองข้อมูลส่วนบุคคลสำหรับบุคลากร" },
      { id: "tr-005", title: "นวัตกรรมทางนิติศาสตร์", trainerName: "วิทยากรภายนอก", location: "อาคารศาลปกครอง", startDate: "2026-05-10", endDate: "2026-05-10", totalHours: 8, maxAttendees: 40, participants: [{ name: "คุณ", status: "completed", score: 92 }], status: "completed", description: "อบรมนวัตกรรมและเทคโนโลยีทางกฎหมาย" },
      { id: "tr-006", title: "การพัฒนาหลักสูตร OBE", trainerName: "ฝ่ายวิชาการ", location: "ห้องประชุม 201", startDate: "2026-10-01", endDate: "2026-10-02", totalHours: 16, maxAttendees: 25, participants: [], status: "planned", description: "อบรมการพัฒนาหลักสูตรแบบ Outcome-Based Education" },
    ];

    let filtered = allTrainings;
    if (type === "upcoming") filtered = allTrainings.filter(t => t.status === "planned");
    else if (type === "completed") filtered = allTrainings.filter(t => t.status === "completed");

    const total = filtered.length;
    const start = ((page || 1) - 1) * (limit || 20);
    return success(filtered.slice(start, start + (limit || 20)), { total, page: page || 1, limit: limit || 20 });
  } catch { return error("INTERNAL", "ไม่สามารถดึงข้อมูลอบรมได้"); }
}
