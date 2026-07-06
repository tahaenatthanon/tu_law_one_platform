import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  await requireAuth().catch((e) => { throw e; });
  try {
    const { page, limit, skip } = parsePagination(req);
    const url = new URL(req.url);
    const type = url.searchParams.get("type"); // vehicles | bookings | my-bookings

    if (type === "vehicles") {
      const [data, total] = await Promise.all([
        prisma.fleetVehicle.findMany({ skip, take: limit, orderBy: { licensePlate: "asc" } }),
        prisma.fleetVehicle.count(),
      ]);
      return success(data, { total, page, limit });
    }

    if (type === "my-bookings") {
      const user = await requireAuth().catch((e) => { throw e; });
      const [data, total] = await Promise.all([
        prisma.fleetVehicleBooking.findMany({ where: { userId: user.id }, include: { vehicle: true }, skip, take: limit, orderBy: { createdAt: "desc" } }),
        prisma.fleetVehicleBooking.count({ where: { userId: user.id } }),
      ]);
      return success(data, { total, page, limit });
    }

    const [data, total] = await Promise.all([
      prisma.fleetVehicleBooking.findMany({ include: { vehicle: true }, skip, take: limit, orderBy: { startTime: "asc" } }),
      prisma.fleetVehicleBooking.count(),
    ]);
    return success(data, { total, page, limit });
  } catch (e) {
    return error("INTERNAL", "ไม่สามารถดึงข้อมูลการจองรถได้");
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth().catch((e) => { throw e; });
  try {
    const body = await req.json();
    const { vehicleId, purpose, destination, passengerCount, startTime, endTime } = body;

    if (!vehicleId || !purpose || !startTime || !endTime) {
      return error("VALIDATION", "กรุณากรอกข้อมูลให้ครบถ้วน");
    }

    // Check double booking
    const conflict = await prisma.fleetVehicleBooking.findFirst({
      where: { vehicleId, status: { notIn: ["cancelled", "rejected"] }, startTime: { lt: new Date(endTime) }, endTime: { gt: new Date(startTime) } },
    });
    if (conflict) return error("CONFLICT", "ช่วงเวลานี้มีผู้จองรถคันนี้แล้ว");

    const booking = await prisma.fleetVehicleBooking.create({
      data: { vehicleId, userId: user.id, purpose, destination, passengerCount, startTime: new Date(startTime), endTime: new Date(endTime), status: "pending", createdBy: user.id },
      include: { vehicle: true },
    });
    return success(booking);
  } catch (e) {
    return error("INTERNAL", "ไม่สามารถจองรถได้");
  }
}
