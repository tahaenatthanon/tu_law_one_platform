import ldap from "ldapjs";
import { prisma } from "./prisma";

const LDAP_URL = process.env.LDAP_URL || "ldap://ad.tu.ac.th";
const LDAP_BASE_DN = process.env.LDAP_BASE_DN || "dc=tu,dc=ac,dc=th";
const LDAP_DOMAIN = process.env.LDAP_DOMAIN || "tu.ac.th";

interface AdUserResult {
  email: string;
  firstNameTh: string;
  lastNameTh: string;
  dn: string;
  department?: string;
}

/**
 * ยืนยันตัวตนผ่าน Active Directory (LDAP)
 */
export async function authenticateAdUser(
  email: string,
  password: string
): Promise<AdUserResult | null> {
  return new Promise((resolve) => {
    const client = ldap.createClient({
      url: LDAP_URL,
      connectTimeout: 5000, // 5 วิ timeout
      timeout: 5000,
    });
    const username = email.split("@")[0];
    const userDn = `uid=${username},${LDAP_BASE_DN}`;

    client.bind(userDn, password, (err) => {
      if (err) {
        client.destroy();
        resolve(null);
        return;
      }

      // Bind สำเร็จ → ดึงข้อมูลผู้ใช้จาก AD
      const searchOpts: ldap.SearchOptions = {
        filter: `(uid=${username})`,
        scope: "sub",
        attributes: ["mail", "givenName", "sn", "departmentNumber", "ou"],
      };

      client.search(LDAP_BASE_DN, searchOpts, (searchErr, res) => {
        if (searchErr) {
          client.destroy();
          resolve(null);
          return;
        }

        let found = false;

        res.on("searchEntry", (entry) => {
          if (found) return;
          found = true;

          const attrs = entry.pojo.attributes;
          const attrMap: Record<string, any> = {};
          if (Array.isArray(attrs)) {
            attrs.forEach((a: any) => {
              attrMap[a.type] = a.values;
            });
          }
          const result: AdUserResult = {
            email: attrMap.mail?.[0] || email,
            firstNameTh: (attrMap.givenName?.[0] as string) || username,
            lastNameTh: (attrMap.sn?.[0] as string) || "",
            dn: entry.pojo.objectName || userDn,
          };

          // ซิงค์/อัปเดตข้อมูลผู้ใช้ใน Database
          syncUserFromAd(result).catch(console.error);

          client.destroy();
          resolve(result);
        });

        res.on("end", () => {
          if (!found) {
            // ไม่พบ entry แต่ bind สำเร็จ — ใช้ email fallback
            client.destroy();
            resolve({
              email,
              firstNameTh: username,
              lastNameTh: "",
              dn: userDn,
            });
          }
        });

        res.on("error", () => {
          client.destroy();
          resolve(null);
        });
      });
    });
  });
}

/**
 * ซิงค์ข้อมูลผู้ใช้จาก AD → Database
 */
async function syncUserFromAd(adUser: AdUserResult): Promise<void> {
  try {
    const existing = await prisma.user.findUnique({
      where: { email: adUser.email },
    });

    if (existing) {
      await prisma.user.update({
        where: { email: adUser.email },
        data: {
          firstNameTh: adUser.firstNameTh,
          lastNameTh: adUser.lastNameTh,
        },
      });
    }
  } catch (error) {
    console.error("[AD Sync] Failed to sync user:", error);
  }
}
