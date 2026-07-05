import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { createAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.errors.map((e) => e.message).join(", "),
          },
        },
        { status: 400 }
      );
    }

    const { email, password, firstNameTh, lastNameTh, departmentId } =
      parsed.data;

    // ตรวจสอบอีเมลซ้ำ
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EMAIL_EXISTS",
            message: "อีเมลนี้มีในระบบแล้ว",
          },
        },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // สร้างผู้ใช้
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstNameTh,
        lastNameTh,
        departmentId: departmentId ?? null,
        status: "active",
      },
    });

    // บันทึก Audit Log
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = req.headers.get("user-agent");

    await createAuditLog({
      userId: user.id,
      action: "USER_REGISTER",
      module: "auth",
      detail: `ลงทะเบียนผู้ใช้ใหม่: ${email}`,
      ipAddress,
      userAgent,
      roleAtTime: "user",
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          firstNameTh: user.firstNameTh,
          lastNameTh: user.lastNameTh,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Register] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "เกิดข้อผิดพลาดภายในระบบ",
        },
      },
      { status: 500 }
    );
  }
}
