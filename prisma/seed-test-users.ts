import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: "postgresql://natthanon:ktnbs007@192.168.1.50/tulaw?schema=public",
  }),
});

const testUsers = [
  { email: "admin@tulaw.ac.th", password: "TuLaw@2026!", firstName: "ผู้ดูแล", lastName: "ระบบ", roleCode: "super_admin" },
  { email: "sysadmin@tulaw.ac.th", password: "TuLaw@2026!", firstName: "ผู้ดูแล", lastName: "ระบบ", roleCode: "system_admin" },
  { email: "dean@tulaw.ac.th", password: "TuLaw@2026!", firstName: "คณบดี", lastName: "นิติศาสตร์", roleCode: "dean" },
  { email: "deptadmin@tulaw.ac.th", password: "TuLaw@2026!", firstName: "หัวหน้า", lastName: "แผนก", roleCode: "dept_admin" },
  { email: "user@tulaw.ac.th", password: "TuLaw@2026!", firstName: "บุคลากร", lastName: "ทั่วไป", roleCode: "user" },
  { email: "viewer@tulaw.ac.th", password: "TuLaw@2026!", firstName: "ผู้ชม", lastName: "ข้อมูล", roleCode: "viewer" },
];

async function main() {
  console.log("🌱 Seeding test users for all 6 roles...\n");

  const dept = await prisma.department.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: "สำนักงานคณะนิติศาสตร์", status: "active" },
  });

  for (const u of testUsers) {
    const role = await prisma.role.findUnique({ where: { roleCode: u.roleCode } });
    if (!role) { console.log(`❌ Role not found: ${u.roleCode}`); continue; }

    const hash = await bcrypt.hash(u.password, 12);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash: hash, firstNameTh: u.firstName, lastNameTh: u.lastName, departmentId: dept.id },
      create: { email: u.email, passwordHash: hash, firstNameTh: u.firstName, lastNameTh: u.lastName, departmentId: dept.id },
    });

    // Assign role
    const existing = await prisma.userRole.findFirst({ where: { userId: user.id, roleId: role.id } });
    if (!existing) {
      await prisma.userRole.create({ data: { userId: user.id, roleId: role.id, isActive: true } });
    }

    console.log(`✅ ${u.roleCode.padEnd(14)} | ${u.email.padEnd(28)} | ${u.password}`);
  }

  await prisma.$disconnect();
  console.log("\n🎉 All 6 test users ready!");
}

main().catch((e) => { console.error(e); process.exit(1); });
