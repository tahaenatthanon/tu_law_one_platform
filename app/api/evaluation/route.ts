import { NextRequest } from "next/server";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

// TODO: Replace with prisma.hrPerformanceEvaluation when model is added to schema

const mockEvaluations = [
  { id: 1, userId: "", evalYear: 2569, score: 85, grade: "A", status: "completed", createdAt: "2026-06-15T00:00:00Z" },
];

export async function GET(req: NextRequest) {
  const user = await requireAuth();
  try {
    const { page, limit, skip } = parsePagination(req);

    const data = mockEvaluations.filter((e) => e.userId === user.id || e.userId === "");
    const total = data.length;
    const paged = data.slice(skip, skip + limit);
    return success(paged, { total, page, limit });
  } catch (e) {
    return error("INTERNAL", "ไม่สามารถดึงข้อมูลการประเมินได้");
  }
}
