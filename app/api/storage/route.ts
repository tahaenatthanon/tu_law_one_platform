import { NextRequest } from "next/server";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await requireAuth();
  try {
    const { page, limit, skip } = parsePagination(req);
    const url = new URL(req.url);
    const poolType = url.searchParams.get("poolType") ?? "personal";
    const q = url.searchParams.get("q") ?? "";
    const userId = url.searchParams.get("userId") ?? user.id;
    const deptId = url.searchParams.get("deptId");

    const where: Record<string, unknown> = {};
    if (poolType === "personal") { where.poolType = "personal"; where.ownerUserId = userId; }
    else if (poolType === "dept") { where.poolType = "department"; if (deptId) where.departmentId = parseInt(deptId); }
    else { where.poolType = "central"; }
    if (q) where.title = { contains: q };

    const [data, total] = await Promise.all([
      prisma.document.findMany({ where: where as any, skip, take: limit, include: { storageFile: true, owner: true, department: true }, orderBy: { updatedAt: "desc" } }),
      prisma.document.count({ where: where as any }),
    ]);
    return success(data, { total, page, limit });
  } catch { return error("INTERNAL", "ไม่สามารถดึงข้อมูลเอกสารได้"); }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  try {
    const body = await req.json();
    const { title, poolType, departmentId } = body;
    if (!title || !poolType) return error("VALIDATION", "กรุณากรอกข้อมูลให้ครบถ้วน");

    const doc = await prisma.document.create({
      data: { title, poolType, ownerUserId: user.id, departmentId: departmentId ? parseInt(departmentId) : null, storageFileId: "00000000-0000-0000-0000-000000000001", createdBy: user.id, updatedBy: user.id },
      include: { owner: true, department: true },
    });
    return success(doc);
  } catch { return error("INTERNAL", "ไม่สามารถสร้างเอกสารได้"); }
}
