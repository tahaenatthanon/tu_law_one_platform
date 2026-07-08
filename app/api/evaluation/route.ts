import { NextRequest } from "next/server";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

/**
 * Evaluation API — returns performance evaluations for the current user.
 * Uses seeded data; connect to prisma.hrEvaluation once the model is added to schema.
 */
export async function GET(req: NextRequest) {
  const user = await requireAuth();
  try {
    const { page, limit } = parsePagination(req);
    const period = new URL(req.url).searchParams.get("period");

    const allEvaluations = [
      { id: "ev-001", period: "2569/1", evaluatorName: "ผู้บังคับบัญชาสายตรง", totalScore: 87, maxScore: 100, grade: "A", status: "completed", comment: "ปฏิบัติงานได้ดีเยี่ยม มีความรับผิดชอบสูง", createdAt: "2026-06-15" },
      { id: "ev-002", period: "2568/2", evaluatorName: "ผู้บังคับบัญชาสายตรง", totalScore: 82, maxScore: 100, grade: "B+", status: "completed", comment: "ผลงานอยู่ในเกณฑ์ดี ควรพัฒนาทักษะภาษาอังกฤษ", createdAt: "2025-11-20" },
      { id: "ev-003", period: "2568/1", evaluatorName: "หัวหน้าฝ่าย", totalScore: 78, maxScore: 100, grade: "B", status: "completed", comment: "มีพัฒนาการที่ดีขึ้นจากรอบก่อน", createdAt: "2025-06-10" },
    ];

    const filtered = period ? allEvaluations.filter(e => e.period.includes(period)) : allEvaluations;
    const total = filtered.length;
    const start = ((page || 1) - 1) * (limit || 20);
    return success(filtered.slice(start, start + (limit || 20)), { total, page: page || 1, limit: limit || 20 });
  } catch {
    return error("INTERNAL", "ไม่สามารถดึงข้อมูลการประเมินได้");
  }
}
