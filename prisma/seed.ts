import { PrismaClient, UserStatus } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Department
  const dept = await prisma.department.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "สำนักงานคณะนิติศาสตร์",
      contactEmail: "law@tu.ac.th",
      telephone: "02-613-2101",
      status: "active",
    },
  });
  console.log(`✅ Department: ${dept.name}`);

  // 2. Role — super_admin
  const role = await prisma.role.upsert({
    where: { roleCode: "super_admin" },
    update: {},
    create: {
      roleCode: "super_admin",
      nameTh: "Super Admin",
    },
  });
  console.log(`✅ Role: ${role.nameTh}`);

  // 3. User
  const passwordHash = await bcrypt.hash("TuLaw@2026!", 12);
  const user = await prisma.user.upsert({
    where: { email: "admin@tulaw.ac.th" },
    update: { passwordHash, status: UserStatus.ACTIVE },
    create: {
      email: "admin@tulaw.ac.th",
      firstNameTh: "ผู้ดูแล",
      lastNameTh: "ระบบ",
      departmentId: dept.id,
      passwordHash,
      status: UserStatus.ACTIVE,
    },
  });
  console.log(`✅ User: ${user.email}`);

  // 4. UserRole
  const existingUserRole = await prisma.userRole.findFirst({
    where: { userId: user.id, roleId: role.id },
  });
  if (!existingUserRole) {
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: role.id,
        isActive: true,
      },
    });
    console.log(`✅ UserRole: ${user.email} → ${role.roleCode}`);
  } else {
    console.log(`⏭️ UserRole already exists: ${user.email} → ${role.roleCode}`);
  }

  // 5. More Departments
  const depts = [
    { id: 2, name: "ฝ่ายวิชาการ", contactEmail: "academic.law@tu.ac.th", telephone: "02-613-2102", location: "ชั้น 3 อาคารคณะนิติศาสตร์" },
    { id: 3, name: "ฝ่ายเทคโนโลยีสารสนเทศ", contactEmail: "it.law@tu.ac.th", telephone: "02-613-2103", location: "ชั้น 4 อาคารคณะนิติศาสตร์" },
    { id: 4, name: "ฝ่ายการเงินและบัญชี", contactEmail: "finance.law@tu.ac.th", telephone: "02-613-2104", location: "ชั้น 2 อาคารคณะนิติศาสตร์" },
    { id: 5, name: "ฝ่ายวิจัยและนวัตกรรม", contactEmail: "research.law@tu.ac.th", telephone: "02-613-2105", location: "ชั้น 5 อาคารคณะนิติศาสตร์" },
    { id: 6, name: "ฝ่ายกิจการนักศึกษา", contactEmail: "student.law@tu.ac.th", telephone: "02-613-2106", location: "ชั้น 1 อาคารคณะนิติศาสตร์" },
  ];
  for (const d of depts) {
    await prisma.department.upsert({ where: { id: d.id }, update: {}, create: d });
  }
  console.log("✅ Additional Departments");

  // 6. Announcement Categories
  const annCats = [
    { id: 1, name: "urgent", description: "ประกาศด่วน" },
    { id: 2, name: "invitation", description: "เชิญชวน" },
    { id: 3, name: "result", description: "ประกาศผล" },
    { id: 4, name: "policy", description: "นโยบาย" },
  ];
  for (const c of annCats) {
    await prisma.announcementCategory.upsert({ where: { id: c.id }, update: {}, create: c });
  }
  console.log("✅ Announcement Categories");

  // 7. Calendar Categories
  const calCats = [
    { id: 1, name: "ประชุม", colorCode: "#8B1515" },
    { id: 2, name: "สัมมนา", colorCode: "#4A90D9" },
    { id: 3, name: "สอบ", colorCode: "#EA580C" },
    { id: 4, name: "วันหยุด", colorCode: "#059669" },
    { id: 5, name: "กำหนดส่ง", colorCode: "#FDB813" },
  ];
  for (const c of calCats) {
    await prisma.calendarCategory.upsert({ where: { id: c.id }, update: {}, create: c });
  }
  console.log("✅ Calendar Categories");

  // 8. Organization Stats
  const stats = [
    { id: 1, statKey: "personnel", statValue: 48, labelTh: "บุคลากร", labelEn: "Personnel", icon: "👥", sortOrder: 1 },
    { id: 2, statKey: "curriculum", statValue: 12, labelTh: "หลักสูตร", labelEn: "Curriculum", icon: "📚", sortOrder: 2 },
    { id: 3, statKey: "research", statValue: 85, labelTh: "ผลงานวิจัย", labelEn: "Research Works", icon: "🔬", sortOrder: 3 },
    { id: 4, statKey: "students", statValue: 2500, labelTh: "นักศึกษาปัจจุบัน", labelEn: "Current Students", icon: "🎓", sortOrder: 4 },
  ];
  for (const s of stats) {
    await prisma.organizationStat.upsert({ where: { id: s.id }, update: {}, create: s });
  }
  console.log("✅ Organization Stats");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("🎉 Seeding complete!");
  })
  .catch(async (e) => {
    console.error("❌ Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
