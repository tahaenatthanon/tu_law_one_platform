import { prisma } from "./prisma";

interface AuditLogInput {
  userId?: string;
  action: string;
  module: string;
  detail?: string;
  ipAddress?: string;
  userAgent?: string;
  roleAtTime?: string;
}

/**
 * บันทึก Immutable Audit Log — บันทึกแล้วไม่สามารถแก้ไขหรือลบได้
 */
export async function createAuditLog(input: AuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        module: input.module,
        detail: input.detail ?? null,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
        roleAtTime: input.roleAtTime ?? null,
      },
    });
  } catch (error) {
    console.error("[AuditLog] Failed to write audit log:", error);
    // ไม่ throw error — audit log ห้ามกระทบการทำงานหลัก
  }
}
