import { PrismaClient, UserStatus } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

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
