import { NextRequest } from "next/server";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

// TODO: Replace with prisma.academicSyllabus when model is added

const mockSyllabi = [
  { id: 1, courseId: "LW101", academicYear: 2569, semester: 1, sectionNo: 1, instructorId: "", objective: "ศึกษาหลักกฎหมายพื้นฐาน", description: "คำอธิบายรายวิชา", evaluationMethod: "สอบปลายภาค", status: "published", topics: [], createdAt: "2026-06-01T00:00:00Z" },
];

export async function GET(req: NextRequest) {
  const user = await requireAuth();
  try {
    const { page, limit, skip } = parsePagination(req);
    const url = new URL(req.url);
    const courseId = url.searchParams.get("courseId");
    const status = url.searchParams.get("status");

    let data = [...mockSyllabi];
    if (courseId) data = data.filter((s) => s.courseId === courseId);
    if (status) data = data.filter((s) => s.status === status);

    const total = data.length;
    data = data.slice(skip, skip + limit);
    return success(data, { total, page, limit });
  } catch (e) {
    return error("INTERNAL", "ไม่สามารถดึงข้อมูลแผนการสอนได้");
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  try {
    const body = await req.json();
    const { courseId, academicYear, semester, sectionNo, instructorId, objective, description, evaluationMethod, topics } = body;

    if (!courseId || !academicYear || !semester || !instructorId) {
      return error("VALIDATION", "กรุณากรอกข้อมูลให้ครบถ้วน");
    }

    const syllabus = { id: Date.now(), courseId, academicYear, semester, sectionNo: sectionNo ?? 1, instructorId, objective, description, evaluationMethod, status: "published", topics: topics ?? [], createdAt: new Date().toISOString() };
    mockSyllabi.push(syllabus);
    return success(syllabus);
  } catch (e) {
    return error("INTERNAL", "ไม่สามารถสร้างแผนการสอนได้");
  }
}

export async function PUT(req: NextRequest) {
  const user = await requireAuth();
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return error("VALIDATION", "กรุณาระบุรหัสแผนการสอน");

    const idx = mockSyllabi.findIndex((s) => s.id === id);
    if (idx === -1) return error("NOT_FOUND", "ไม่พบแผนการสอน");

    mockSyllabi[idx] = { ...mockSyllabi[idx], ...updates };
    return success(mockSyllabi[idx]);
  } catch (e) {
    return error("INTERNAL", "ไม่สามารถอัปเดตแผนการสอนได้");
  }
}
