import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: "postgresql://natthanon:ktnbs007@192.168.1.50/tulaw?schema=public",
  }),
});

const roles = [
  { id: 1, roleCode: "super_admin", nameTh: "Super Admin (สิทธิ์สูงสุด)" },
  { id: 2, roleCode: "system_admin", nameTh: "System Admin (ดูแลระบบ)" },
  { id: 3, roleCode: "dean", nameTh: "Dean (คณบดี)" },
  { id: 4, roleCode: "dept_admin", nameTh: "Dept Admin (ผู้ดูแลแผนก)" },
  { id: 5, roleCode: "user", nameTh: "User (บุคลากรทั่วไป)" },
  { id: 6, roleCode: "viewer", nameTh: "Viewer (สิทธิ์ดูอย่างเดียว)" },
];

async function main() {
  // 1. ล้าง user_roles ก่อน (FK constraint)
  await prisma.$executeRawUnsafe(`DELETE FROM user_roles`);
  console.log("🧹 Cleared all user_roles");

  // 2. ล้าง app_permissions ก่อน (FK constraint)
  await prisma.$executeRawUnsafe(`DELETE FROM app_permissions`);
  console.log("🧹 Cleared all app_permissions");

  // 3. ล้าง role_permissions ก่อน (FK constraint)
  await prisma.$executeRawUnsafe(`DELETE FROM role_permissions`);
  console.log("🧹 Cleared all role_permissions");

  // 4. ล้าง roles ทั้งหมด
  await prisma.$executeRawUnsafe(`DELETE FROM roles`);
  console.log("🧹 Cleared all roles");

  // 3. รีเซ็ต sequence กลับไปเริ่มที่ 1
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE roles_id_seq RESTART WITH 1`);
  console.log("🔄 Sequence reset to 1");

  // 4. Insert roles ด้วย id ที่กำหนด
  for (const r of roles) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO roles (id, role_code, name_th, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())`,
      r.id, r.roleCode, r.nameTh
    );
    console.log(`✅ ${r.id} → ${r.roleCode}`);
  }

  // 5. ตั้ง sequence ให้ต่อหลังจาก id สูงสุด
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE roles_id_seq RESTART WITH 7`);
  console.log("🔄 Sequence set to 7");

  // 6. ผูก admin กลับไปที่ super_admin (id=1)
  const admin = await prisma.user.findUnique({ where: { email: "admin@tulaw.ac.th" } });
  if (admin) {
    await prisma.userRole.create({
      data: { userId: admin.id, roleId: 1, isActive: true },
    });
    console.log(`🔗 Re-linked: admin@tulaw.ac.th → super_admin`);
  }

  await prisma.$disconnect();
  console.log("\n🎉 Roles reset to IDs 1-6!");
}

main().catch((e) => { console.error(e); process.exit(1); });
