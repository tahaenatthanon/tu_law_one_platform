import { prisma } from "@/lib/prisma";
import { success, error } from "@/lib/api-utils";

export async function GET() {
  try {
    const stats = await prisma.organizationStat.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    // Fallback: compute from live data if no stats configured
    const data = stats.length > 0 ? stats : [
      { id: 0, statKey: "personnel", statValue: await prisma.user.count({ where: { status: "ACTIVE" } }), labelTh: "บุคลากร", labelEn: "Personnel", icon: "👥", sortOrder: 1, isActive: true },
      { id: 0, statKey: "curriculum", statValue: await prisma.department.count(), labelTh: "หลักสูตร", labelEn: "Curriculum", icon: "📚", sortOrder: 2, isActive: true },
      { id: 0, statKey: "research", statValue: await prisma.project.count({ where: { status: "completed" } }), labelTh: "ผลงานวิจัย", labelEn: "Research", icon: "🔬", sortOrder: 3, isActive: true },
      { id: 0, statKey: "students", statValue: 2500, labelTh: "นักศึกษาปัจจุบัน", labelEn: "Current Students", icon: "🎓", sortOrder: 4, isActive: true },
    ];

    return success(data);
  } catch {
    return error("INTERNAL", "ไม่สามารถดึงข้อมูลสถิติได้");
  }
}
