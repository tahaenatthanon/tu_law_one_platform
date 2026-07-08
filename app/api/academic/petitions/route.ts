import { NextRequest } from "next/server";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

const PETITIONS = [
  { id: "pet-1", typeName: "คำร้องขอลงทะเบียนล่าช้า", subject: "ขอลงทะเบียนรายวิชาเพิ่ม ภาค 1/2569", detail: "เนื่องจากติดภารกิจจำเป็น", requesterName: "สมชาย ใจดี", status: "pending", semester: 1, academicYear: 2569, createdAt: "2569-07-01" },
  { id: "pet-2", typeName: "คำร้องขอย้ายกลุ่มเรียน", subject: "ขอย้ายกลุ่มเรียนวิชา น.201", detail: "ตารางเรียนชนกัน", requesterName: "ปรีชา วิชาการ", status: "approved", semester: 1, academicYear: 2569, approverName: "คณบดี", approvedAt: "2569-06-28", createdAt: "2569-06-25" },
  { id: "pet-3", typeName: "คำร้องขอเทียบโอนหน่วยกิต", subject: "ขอเทียบโอนหน่วยกิตจากสถาบันเดิม", detail: "เคยศึกษาที่มหาวิทยาลัยอื่น", requesterName: "ธนา กฎหมาย", status: "rejected", semester: 1, academicYear: 2569, approverName: "หัวหน้าฝ่าย", rejectedReason: "เอกสารไม่ครบถ้วน", createdAt: "2569-06-20" },
];

export async function GET(req: NextRequest) {
  await requireAuth();
  try {
    const { page, limit } = parsePagination(req);
    const status = new URL(req.url).searchParams.get("status");
    const filtered = status ? PETITIONS.filter(p => p.status === status) : PETITIONS;
    const total = filtered.length;
    const start = ((page || 1) - 1) * (limit || 20);
    return success(filtered.slice(start, start + (limit || 20)), { total, page: page || 1, limit: limit || 20 });
  } catch { return error("INTERNAL", "ไม่สามารถดึงข้อมูลคำร้องได้"); }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  try {
    const body = await req.json();
    const newPetition = { id: `pet-${Date.now()}`, typeName: body.typeName || "คำร้องทั่วไป", subject: body.subject, detail: body.detail, requesterName: "คุณ", status: "pending", semester: body.semester ?? 1, academicYear: body.academicYear ?? 2569, createdAt: new Date().toISOString() };
    return success(newPetition);
  } catch { return error("INTERNAL", "ไม่สามารถส่งคำร้องได้"); }
}
