import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { authenticateAdUser } from "./ldap";
import { createAuditLog } from "./audit";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your@law.tu.ac.th" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const ipAddress =
          (req?.headers?.["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
          (req?.headers?.["x-real-ip"] as string) ||
          "unknown";

        const userAgent = (req?.headers?.["user-agent"] as string) || null;

        try {
          // ─── Step 1: ลอง authenticate ผ่าน Active Directory ก่อน ───
          const adUser = await authenticateAdUser(
            credentials.email,
            credentials.password
          );

          if (adUser) {
            // หา user ใน DB (ต้องมีอยู่แล้วจาก AD Sync)
            let user = await prisma.user.findUnique({
              where: { email: adUser.email },
              include: {
                userRoles: {
                  where: { isActive: true },
                  include: { role: true },
                },
              },
            });

            if (!user) {
              // User ยังไม่มีใน DB → สร้างให้ (fallback)
              user = await prisma.user.create({
                data: {
                  email: adUser.email,
                  firstNameTh: adUser.firstNameTh,
                  lastNameTh: adUser.lastNameTh,
                  adSynced: true,
                  adDn: adUser.dn,
                  status: "active",
                },
                include: {
                  userRoles: {
                    where: { isActive: true },
                    include: { role: true },
                  },
                },
              });
            }

            const roleNames = user.userRoles.map((ur) => ur.role.roleCode);

            await createAuditLog({
              userId: user.id,
              action: "USER_LOGIN",
              module: "auth",
              detail: `AD login สำเร็จ: ${user.email}`,
              ipAddress,
              userAgent,
              roleAtTime: roleNames.join(",") || "unknown",
            });

            return {
              id: user.id,
              email: user.email,
              name: `${user.firstNameTh} ${user.lastNameTh}`,
              roles: roleNames,
              departmentId: user.departmentId,
              status: user.status,
            };
          }

          // ─── Step 2: Fallback — authenticate ผ่าน Database ───
          const dbUser = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              userRoles: {
                where: { isActive: true },
                include: { role: true },
              },
            },
          });

          if (!dbUser || !dbUser.passwordHash) {
            await createAuditLog({
              userId: undefined,
              action: "USER_LOGIN_FAILED",
              module: "auth",
              detail: `เข้าสู่ระบบล้มเหลว (ไม่พบผู้ใช้): ${credentials.email}`,
              ipAddress,
              userAgent,
            });
            return null;
          }

          if (dbUser.status !== "active") {
            await createAuditLog({
              userId: dbUser.id,
              action: "USER_LOGIN_FAILED",
              module: "auth",
              detail: `เข้าสู่ระบบล้มเหลว (สถานะไม่อนุญาต: ${dbUser.status}): ${credentials.email}`,
              ipAddress,
              userAgent,
            });
            return null;
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            dbUser.passwordHash
          );

          if (!isValid) {
            await createAuditLog({
              userId: dbUser.id,
              action: "USER_LOGIN_FAILED",
              module: "auth",
              detail: `เข้าสู่ระบบล้มเหลว (รหัสผ่านไม่ถูกต้อง): ${credentials.email}`,
              ipAddress,
              userAgent,
            });
            return null;
          }

          const dbRoleNames = dbUser.userRoles.map((ur) => ur.role.roleCode);

          await createAuditLog({
            userId: dbUser.id,
            action: "USER_LOGIN",
            module: "auth",
            detail: `DB login สำเร็จ: ${dbUser.email}`,
            ipAddress,
            userAgent,
            roleAtTime: dbRoleNames.join(",") || "unknown",
          });

          return {
            id: dbUser.id,
            email: dbUser.email,
            name: `${dbUser.firstNameTh} ${dbUser.lastNameTh}`,
            roles: dbRoleNames,
            departmentId: dbUser.departmentId,
            status: dbUser.status,
          };
        } catch (error) {
          console.error("[Auth] Error:", error);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: Number(process.env.SESSION_MAX_AGE) || 28800, // 8 ชั่วโมง
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roles = (user as any).roles || [];
        token.departmentId = (user as any).departmentId;
        token.status = (user as any).status;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).roles = token.roles || [];
        (session.user as any).departmentId = token.departmentId;
        (session.user as any).status = token.status;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
