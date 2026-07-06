import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: "postgresql://natthanon:ktnbs007@192.168.1.50/tulaw?schema=public",
  }),
});

async function main() {
  const hash = await bcrypt.hash("TuLaw@2026!", 12);
  const user = await prisma.user.update({
    where: { email: "admin@tulaw.ac.th" },
    data: { passwordHash: hash },
  });
  console.log(`✅ Updated: ${user.email}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
