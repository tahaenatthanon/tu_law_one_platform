import { NextRequest } from "next/server";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

const WORKFLOWS = [
  { id: "wf-1", name: "อนุมัติลา", description: "Workflow อนุมัติคำขอลา", createdAt: "2569-01-01", steps: [{ order: 1, approver: { name: "ผู้บังคับบัญชา" } }, { order: 2, approver: { name: "หัวหน้าฝ่าย" } }] },
  { id: "wf-2", name: "อนุมัติงบประมาณ", description: "Workflow อนุมัติงบประมาณโครงการ", createdAt: "2569-03-01", steps: [{ order: 1, approver: { name: "หัวหน้าฝ่าย" } }, { order: 2, approver: { name: "คณบดี" } }] },
];

const INSTANCES = [
  { id: "inst-1", workflow: { name: "อนุมัติลา" }, status: "in_progress", createdAt: "2569-07-01", stepResults: [{ step: { name: "ผู้บังคับบัญชา", order: 1 }, status: "approved" }, { step: { name: "หัวหน้าฝ่าย", order: 2 }, status: "pending" }] },
  { id: "inst-2", workflow: { name: "อนุมัติงบประมาณ" }, status: "completed", createdAt: "2569-06-15", stepResults: [{ step: { name: "หัวหน้าฝ่าย", order: 1 }, status: "approved" }, { step: { name: "คณบดี", order: 2 }, status: "approved" }] },
];

export async function GET(req: NextRequest) {
  await requireAuth();
  try {
    const { page, limit } = parsePagination(req);
    const type = new URL(req.url).searchParams.get("type");
    const data = type === "instances" ? INSTANCES : WORKFLOWS;
    const start = ((page || 1) - 1) * (limit || 20);
    return success(data.slice(start, start + (limit || 20)), { total: data.length, page: page || 1, limit: limit || 20 });
  } catch { return error("INTERNAL", "ไม่สามารถดึงข้อมูล Workflow ได้"); }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  try {
    const body = await req.json();
    return success({ id: `wf-${Date.now()}`, ...body, createdAt: new Date().toISOString() });
  } catch { return error("INTERNAL", "ไม่สามารถสร้าง Workflow ได้"); }
}
