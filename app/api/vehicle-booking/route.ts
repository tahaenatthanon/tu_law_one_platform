import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

// TODO: Replace mock bookings with prisma.fleetVehicleBooking when model is added

const mockBookings: unknown[] = [];

export async function GET(req: NextRequest) {
  await requireAuth();
  try {
    const { page, limit, skip } = parsePagination(req);
    const url = new URL(req.url);
    const type = url.searchParams.get("type");

    if (type === "vehicles") {
      const [data, total] = await Promise.all([
        prisma.fleetVehicle.findMany({ skip, take: limit, orderBy: { licensePlate: "asc" } }),
        prisma.fleetVehicle.count(),
      ]);
      return success(data, { total, page, limit });
    }

    if (type === "my-bookings") {
      const user = await requireAuth().catch((e) => { throw e; });
      const userBookings = mockBookings.filter((b: any) => b.userId === user.id);
      const total = userBookings.length;
      const data = userBookings.slice(skip, skip + limit);
      return success(data, { total, page, limit });
    }

    // All bookings (mock)
    const total = mockBookings.length;
    const data = mockBookings.slice(skip, skip + limit);
    return success(data, { total, page, limit });
  } catch (e) {
    return error("INTERNAL", "ไม่สามารถดึงข้อมูลการจองรถได้");
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  try {
    const body = await req.json();
    const { vehicleId, purpose, destination, passengerCount, startTime, endTime } = body;

    if (!vehicleId || !purpose || !startTime || !endTime) {
      return error("VALIDATION", "กรุณากรอกข้อมูลให้ครบถ้วน");
    }

    // Check double booking (mock)
    const conflict = mockBookings.find((b: any) =>
      b.vehicleId === vehicleId &&
      b.status !== "cancelled" && b.status !== "rejected" &&
      new Date(b.startTime) < new Date(endTime) && new Date(b.endTime) > new Date(startTime)
    );
    if (conflict) return error("CONFLICT", "ช่วงเวลานี้มีผู้จองรถคันนี้แล้ว");

    const booking = { id: Date.now(), vehicleId, userId: user.id, purpose, destination, passengerCount, startTime, endTime, status: "pending", createdAt: new Date().toISOString() };
    mockBookings.push(booking);
    return success(booking);
  } catch (e) {
    return error("INTERNAL", "ไม่สามารถจองรถได้");
  }
}
