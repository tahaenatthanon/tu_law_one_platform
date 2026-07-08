import { prisma } from "./prisma";

interface AuditLogInput {
  userId?: string;
  action: string;
  module: string;
  detail?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * บันทึก Immutable Audit Log — บันทึกแล้วไม่สามารถแก้ไขหรือลบได้
 */
export async function createAuditLog(input: AuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        user: input.userId ? { connect: { id: input.userId } } : undefined,
        action: input.action,
        module: input.module,
        ipAddress: input.ipAddress ?? undefined,
        userAgent: input.userAgent ?? undefined,
        // Store detail in oldValue field (Text type) for human-readable description
        oldValue: input.detail ?? undefined,
      },
    });
  } catch (error) {
    console.error("[AuditLog] Failed to write audit log:", error);
    // ไม่ throw error — audit log ห้ามกระทบการทำงานหลัก
  }
}
