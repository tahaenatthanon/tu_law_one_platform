import { NextRequest } from "next/server";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

/**
 * Curriculum API — returns curriculum/degree programs.
 * Uses seeded data; connect to prisma.academicCurriculum once the model is added to schema.
 */
export async function GET(req: NextRequest) {
  await requireAuth();
  try {
    const { page, limit } = parsePagination(req);

    const curricula = [
      { id: "curr-1", code: "นบ.2564", nameTh: "หลักสูตรนิติศาสตรบัณฑิต (ปรับปรุง 2564)", degreeLevel: "ปริญญาตรี", totalCredits: 138, yearEffective: 2564, status: "active", description: "หลักสูตรนิติศาสตรบัณฑิตที่มุ่งเน้นการผลิตนักกฎหมายที่มีความรู้ความสามารถทางวิชาการและทักษะการปฏิบัติงานด้านกฎหมาย" },
      { id: "curr-2", code: "นม.2563", nameTh: "หลักสูตรนิติศาสตรมหาบัณฑิต สาขากฎหมายมหาชน", degreeLevel: "ปริญญาโท", totalCredits: 42, yearEffective: 2563, status: "active", description: "หลักสูตรนิติศาสตรมหาบัณฑิต เน้นการศึกษากฎหมายมหาชนเชิงลึก" },
      { id: "curr-3", code: "นม.2562", nameTh: "หลักสูตรนิติศาสตรมหาบัณฑิต สาขากฎหมายธุรกิจ", degreeLevel: "ปริญญาโท", totalCredits: 42, yearEffective: 2562, status: "inactive", description: "หลักสูตรนิติศาสตรมหาบัณฑิตด้านกฎหมายธุรกิจและการค้าระหว่างประเทศ" },
    ];

    const total = curricula.length;
    const start = ((page || 1) - 1) * (limit || 20);
    return success(curricula.slice(start, start + (limit || 20)), { total, page: page || 1, limit: limit || 20 });
  } catch { return error("INTERNAL", "ไม่สามารถดึงข้อมูลหลักสูตรได้"); }
}
