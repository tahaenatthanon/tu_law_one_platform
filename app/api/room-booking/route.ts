import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const user = await requireAuth();
  try {
    const { page, limit, skip } = parsePagination(req);
    const url = new URL(req.url);
    const type = url.searchParams.get("type"); // rooms | bookings | my-bookings
    const date = url.searchParams.get("date");

    if (type === "rooms") {
      const [data, total] = await Promise.all([
        prisma.meetingRoom.findMany({ skip, take: limit, orderBy: { name: "asc" } }),
        prisma.meetingRoom.count(),
      ]);
      return success(data, { total, page, limit });
    }

    if (type === "my-bookings") {
      const where: Record<string, unknown> = { userId: user.id };
      if (date) { where.startTime = { gte: new Date(date) }; }
      const [data, total] = await Promise.all([
        prisma.roomBooking.findMany({ where, include: { room: true }, skip, take: limit, orderBy: { startTime: "asc" } }),
        prisma.roomBooking.count({ where }),
      ]);
      return success(data, { total, page, limit });
    }

    const whereB: Record<string, unknown> = {};
    if (date) { whereB.startTime = { gte: new Date(date), lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000) }; }
    const [data, total] = await Promise.all([
      prisma.roomBooking.findMany({ where: whereB, include: { room: true, user: { select: { firstNameTh: true, lastNameTh: true } } }, skip, take: limit, orderBy: { startTime: "asc" } }),
      prisma.roomBooking.count({ where: whereB }),
    ]);
    return success(data, { total, page, limit });
  } catch {
    return error("INTERNAL", "ไม่สามารถดึงข้อมูลการจองได้");
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  try {
    const body = await req.json();
    const { roomId, title, startTime, endTime, attendeeCount, msTeamsLink, remark } = body;

    if (!roomId || !title || !startTime || !endTime) {
      return error("VALIDATION", "กรุณากรอกข้อมูลให้ครบถ้วน");
    }

    // Check double booking
    const conflict = await prisma.roomBooking.findFirst({
      where: { roomId, status: { not: "cancelled" }, startTime: { lt: new Date(endTime) }, endTime: { gt: new Date(startTime) } },
    });
    if (conflict) return error("CONFLICT", "ช่วงเวลานี้มีผู้จองแล้ว");

    const booking = await prisma.roomBooking.create({
      data: { roomId, userId: user.id, title, startTime: new Date(startTime), endTime: new Date(endTime), attendeeCount, msTeamsLink, remark, status: "confirmed", createdBy: user.id },
      include: { room: true },
    });
    return success(booking);
  } catch {
    return error("INTERNAL", "ไม่สามารถจองห้องประชุมได้");
  }
}
