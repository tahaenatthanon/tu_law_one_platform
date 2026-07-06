import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: { status: "ACTIVE" },
    });

    // Online = มี session ที่ยังไม่ logout (logoutTime IS NULL)
    const onlineSessions = await prisma.userSession.findMany({
      where: {
        logoutTime: null,
        loginTime: { not: null },
      },
      select: { userId: true },
      distinct: ["userId"],
    });
    const onlineUsers = onlineSessions.length;

    return NextResponse.json({
      success: true,
      data: { totalUsers, activeUsers, onlineUsers },
    });
  } catch (error) {
    console.error("[API /api/stats] Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "ไม่สามารถดึงข้อมูลสถิติได้" } },
      { status: 500 }
    );
  }
}
