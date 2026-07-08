import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

/**
 * GET /api/audit-log
 * ดึงรายการ audit logs — รองรับ filter ตาม TOR §2.1.9
 * Query params: page, limit, action, module, userId, ipAddress, startDate, endDate
 */
export async function GET(req: NextRequest) {
  const user = await requireAuth();
  try {
    const { page, limit, skip } = parsePagination(req);
    const url = new URL(req.url);

    const action = url.searchParams.get("action");
    const module_ = url.searchParams.get("module");
    const userId = url.searchParams.get("userId");
    const ipAddress = url.searchParams.get("ipAddress");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const isSuccess = url.searchParams.get("isSuccess");

    const where: Record<string, unknown> = {};

    if (action) where.action = action;
    if (module_) where.module = module_;
    if (userId) where.userId = userId;
    if (ipAddress) where.ipAddress = { contains: ipAddress };
    if (isSuccess !== null && isSuccess !== undefined) {
      where.isSuccess = isSuccess === "true";
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as Record<string, unknown>).gte = new Date(startDate);
      if (endDate) (where.createdAt as Record<string, unknown>).lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstNameTh: true,
              lastNameTh: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return success(data, { total, page, limit });
  } catch (e) {
    console.error("[AuditLog API] Error:", e);
    return error("INTERNAL", "ไม่สามารถดึงข้อมูล Audit Log ได้");
  }
}

/**
 * POST /api/audit-log — ไม่รองรับ
 * Audit logs สร้างผ่าน server-side เท่านั้น (immutable)
 */
export async function POST() {
  return error("FORBIDDEN", "ไม่สามารถสร้าง Audit Log ผ่าน API ได้ (Immutable)");
}

/**
 * PUT/PATCH/DELETE — ไม่อนุญาต
 */
export async function PUT() {
  return error("FORBIDDEN", "ไม่สามารถแก้ไข Audit Log ได้ (Immutable)");
}

export async function DELETE() {
  return error("FORBIDDEN", "ไม่สามารถลบ Audit Log ได้ (Immutable)");
}
