import { NextRequest } from "next/server";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

/**
 * Evaluation API — returns performance evaluation records for the current user.
 * Uses seeded data; connect to prisma.hrEvaluation once the model is added to schema.
 */
export async function GET(req: NextRequest) {
  const user = await requireAuth();
  try {
    const { page, limit } = parsePagination(req);
    const url = new URL(req.url);
    const period = url.searchParams.get("period");

    const allEvaluations = [
      { id: "ev-001", period: "2569/1", evaluator: "ผู้บังคับบัญชาสายตรง", totalScore: 87, grade: "A", status: "ผ่านการประเมิน", comment: "ปฏิบัติงานได้ดีเยี่ยม มีความรับผิดชอบสูง", createdAt: "2026-06-15" },
      { id: "ev-002", period: "2568/2", evaluator: "ผู้บังคับบัญชาสายตรง", totalScore: 82, grade: "B+", status: "ผ่านการประเมิน", comment: "ผลงานอยู่ในเกณฑ์ดี ควรพัฒนาทักษะภาษาอังกฤษ", createdAt: "2025-11-20" },
      { id: "ev-003", period: "2568/1", evaluator: "หัวหน้าฝ่าย", totalScore: 78, grade: "B", status: "ผ่านการประเมิน", comment: "มีพัฒนาการที่ดีขึ้นจากรอบก่อน", createdAt: "2025-06-10" },
    ];

    const filtered = period ? allEvaluations.filter(e => e.period.includes(period)) : allEvaluations;
    const total = filtered.length;
    const start = ((page || 1) - 1) * (limit || 20);
    return success(filtered.slice(start, start + (limit || 20)), { total, page: page || 1, limit: limit || 20 });
  } catch {
    return error("INTERNAL", "ไม่สามารถดึงข้อมูลประเมินผลได้");
  }
}
