import { NextRequest } from "next/server";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

const SYLLABI = [
  { id: "syl-1", course: { name: "น.101 กฎหมายแพ่ง: หลักทั่วไป" }, instructor: { name: "สมชาย ใจดี" }, academicYear: 2569, semester: 1, status: "active", topics: [{ weekNo: 1, topic: "บทนำ: ความหมายและลักษณะของกฎหมาย" }, { weekNo: 2, topic: "บุคคลธรรมดาและนิติบุคคล" }, { weekNo: 3, topic: "นิติกรรมและสัญญา" }] },
  { id: "syl-2", course: { name: "น.102 กฎหมายอาญา: ภาคทั่วไป" }, instructor: { name: "ปรีชา วิชาการ" }, academicYear: 2569, semester: 1, status: "active", topics: [{ weekNo: 1, topic: "หลักทั่วไปของกฎหมายอาญา" }, { weekNo: 2, topic: "โครงสร้างความรับผิดทางอาญา" }, { weekNo: 3, topic: "การกระทำและเจตนา" }] },
];

export async function GET(req: NextRequest) {
  await requireAuth();
  try {
    const { page, limit } = parsePagination(req);
    const courseId = new URL(req.url).searchParams.get("courseId");
    const status = new URL(req.url).searchParams.get("status");
    let filtered = SYLLABI;
    if (courseId) filtered = filtered.filter(s => s.id === courseId);
    if (status) filtered = filtered.filter(s => s.status === status);
    const start = ((page || 1) - 1) * (limit || 20);
    return success(filtered.slice(start, start + (limit || 20)), { total: filtered.length, page: page || 1, limit: limit || 20 });
  } catch { return error("INTERNAL", "ไม่สามารถดึงข้อมูลแผนการสอนได้"); }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  try {
    const body = await req.json();
    return success({ id: `syl-${Date.now()}`, ...body, status: "active", topics: [] });
  } catch { return error("INTERNAL", "ไม่สามารถบันทึกแผนการสอนได้"); }
}
