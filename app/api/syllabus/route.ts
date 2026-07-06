import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const user = await requireAuth().catch((e) => { throw e; });
  try {
    const { page, limit, skip } = parsePagination(req);
    const url = new URL(req.url);
    const courseId = url.searchParams.get("courseId");
    const status = url.searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (courseId) where.courseId = courseId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.academicSyllabus.findMany({
        where,
        include: { course: true, instructor: { select: { id: true, firstNameTh: true, lastNameTh: true } }, topics: { orderBy: { weekNo: "asc" } } },
        skip, take: limit, orderBy: { createdAt: "desc" },
      }),
      prisma.academicSyllabus.count({ where }),
    ]);
    return success(data, { total, page, limit });
  } catch (e) {
    return error("INTERNAL", "ไม่สามารถดึงข้อมูลแผนการสอนได้");
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth().catch((e) => { throw e; });
  try {
    const body = await req.json();
    const { courseId, academicYear, semester, sectionNo, instructorId, objective, description, evaluationMethod, topics } = body;

    if (!courseId || !academicYear || !semester || !instructorId) {
      return error("VALIDATION", "กรุณากรอกข้อมูลให้ครบถ้วน");
    }

    const syllabus = await prisma.academicSyllabus.create({
      data: {
        courseId, academicYear, semester, sectionNo: sectionNo ?? 1,
        instructorId, objective, description, evaluationMethod, status: "published",
        createdBy: user.id,
        topics: topics?.length ? {
          create: topics.map((t: { weekNo: number; topic: string; description?: string; materials?: string }) => ({
            weekNo: t.weekNo, topic: t.topic, description: t.description, materials: t.materials, createdBy: user.id,
          })),
        } : undefined,
      },
      include: { course: true, instructor: { select: { id: true, firstNameTh: true, lastNameTh: true } }, topics: { orderBy: { weekNo: "asc" } } },
    });
    return success(syllabus);
  } catch (e) {
    return error("INTERNAL", "ไม่สามารถสร้างแผนการสอนได้");
  }
}

export async function PUT(req: NextRequest) {
  const user = await requireAuth().catch((e) => { throw e; });
  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return error("VALIDATION", "กรุณาระบุรหัสแผนการสอน");

    const syllabus = await prisma.academicSyllabus.update({
      where: { id },
      data: { ...data, updatedBy: user.id },
      include: { course: true, instructor: { select: { id: true, firstNameTh: true, lastNameTh: true } }, topics: { orderBy: { weekNo: "asc" } } },
    });
    return success(syllabus);
  } catch (e) {
    return error("INTERNAL", "ไม่สามารถอัปเดตแผนการสอนได้");
  }
}
