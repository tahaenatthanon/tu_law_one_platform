import { prisma } from "@/lib/prisma";
import { success, error } from "@/lib/api-utils";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      where: { status: "active" },
      select: {
        id: true,
        name: true,
        telephone: true,
        contactEmail: true,
        location: true,
      },
      orderBy: { name: "asc" },
    });
    return success(departments);
  } catch {
    return error("INTERNAL", "ไม่สามารถดึงข้อมูลหน่วยงานได้");
  }
}
