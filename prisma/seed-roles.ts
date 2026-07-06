import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: "postgresql://natthanon:ktnbs007@192.168.1.50/tulaw?schema=public",
  }),
});

const roles = [
  { roleCode: "super_admin", nameTh: "Super Admin (สิทธิ์สูงสุด)" },
  { roleCode: "system_admin", nameTh: "System Admin (ดูแลระบบ)" },
  { roleCode: "dean", nameTh: "Dean (คณบดี)" },
  { roleCode: "dept_admin", nameTh: "Dept Admin (ผู้ดูแลแผนก)" },
  { roleCode: "user", nameTh: "User (บุคลากรทั่วไป)" },
  { roleCode: "viewer", nameTh: "Viewer (สิทธิ์ดูอย่างเดียว)" },
];

async function main() {
  for (const r of roles) {
    const role = await prisma.role.upsert({
      where: { roleCode: r.roleCode },
      update: { nameTh: r.nameTh },
      create: r,
    });
    console.log(`✅ ${role.roleCode} → ${role.nameTh}`);
  }
  await prisma.$disconnect();
  console.log("\n🎉 All 6 roles seeded!");
}

main().catch((e) => { console.error(e); process.exit(1); });
