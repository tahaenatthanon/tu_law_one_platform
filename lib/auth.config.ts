import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { authenticateAdUser } from "./ldap";
import { createAuditLog } from "./audit";

/** ห่อ Promise ด้วย timeout */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
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

        const rawUserAgent = req?.headers?.["user-agent"];
        const userAgent: string | undefined =
          typeof rawUserAgent === "string" ? rawUserAgent : undefined;

        const result = await withTimeout(
          (async () => {
            try {
              console.log("[Auth] authorize called for:", credentials.email);

              // ─── Step 1: LDAP/AD ───
              const ldapEnabled = process.env.LDAP_ENABLED === "true";
              let adUser: Awaited<ReturnType<typeof authenticateAdUser>> = null;

              if (ldapEnabled) {
                adUser = await withTimeout(
                  authenticateAdUser(credentials.email, credentials.password),
                  5000
                );
              }

              if (adUser) {
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
                  user = await prisma.user.create({
                    data: {
                      email: adUser.email,
                      firstNameTh: adUser.firstNameTh,
                      lastNameTh: adUser.lastNameTh,
                      departmentId: 1,
                      status: "ACTIVE",
                    },
                    include: {
                      userRoles: {
                        where: { isActive: true },
                        include: { role: true },
                      },
                    },
                  });
                }

                const roleNames = user.userRoles.map((ur: { role: { roleCode: string } }) => ur.role.roleCode);

                await createAuditLog({
                  userId: user.id,
                  action: "USER_LOGIN",
                  module: "auth",
                  detail: `DB login สำเร็จ: ${user.email} (${roleNames.join(",") || "unknown"})`,
                  ipAddress,
                  userAgent,
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

              // ─── Step 2: DB Fallback ───
              console.log("[Auth] Fallback to DB for:", credentials.email);
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

              if (dbUser.status !== "ACTIVE") {
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

              const dbRoleNames = dbUser.userRoles.map((ur: { role: { roleCode: string } }) => ur.role.roleCode);

              await createAuditLog({
                userId: dbUser.id,
                action: "USER_LOGIN",
                module: "auth",
                detail: `DB login สำเร็จ: ${dbUser.email} (${dbRoleNames.join(",") || "unknown"})`,
                ipAddress,
                userAgent,
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
              console.error("[Auth] authorize error:", error);
              return null;
            }
          })(),
          10000
        );

        if (result === null) {
          console.warn("[Auth] Login timeout or error for:", credentials.email);
        }

        return result ?? null;
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: Number(process.env.SESSION_MAX_AGE) || 28800,
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const googleEmail = profile?.email ?? user.email;
        if (!googleEmail) return false;

        const ipAddress = "google-sso";
        const userAgent = undefined;

        try {
          let dbUser = await prisma.user.findUnique({
            where: { email: googleEmail },
            include: {
              userRoles: {
                where: { isActive: true },
                include: { role: true },
              },
            },
          });

          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email: googleEmail,
                firstNameTh: (profile as any)?.given_name ?? user.name?.split(" ")[0] ?? "",
                lastNameTh: (profile as any)?.family_name ?? user.name?.split(" ").slice(1).join(" ") ?? "",
                departmentId: 1,
                status: "ACTIVE",
              },
              include: {
                userRoles: {
                  where: { isActive: true },
                  include: { role: true },
                },
              },
            });
          }

          const roleNames = dbUser.userRoles.map((ur: { role: { roleCode: string } }) => ur.role.roleCode);
          user.id = dbUser.id;
          user.roles = roleNames;
          user.departmentId = dbUser.departmentId;
          user.status = dbUser.status;

          await createAuditLog({
            userId: dbUser.id,
            action: "USER_LOGIN",
            module: "auth",
            detail: `Google SSO login สำเร็จ: ${googleEmail} (${roleNames.join(",") || "unknown"})`,
            ipAddress,
            userAgent,
          });

          return true;
        } catch (error) {
          console.error("[Auth] signIn error:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        return { ...token, ...session };
      }
      if (user) {
        token.id = user.id;
        token.roles = user.roles;
        token.departmentId = user.departmentId;
        token.status = user.status;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.roles = token.roles;
        session.user.departmentId = token.departmentId;
        session.user.status = token.status;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
};
