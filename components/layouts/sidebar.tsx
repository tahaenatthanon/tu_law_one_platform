"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

type MenuItem = {
  icon: string;
  section: string;
  label: string;
  href: string;
  adminOnly?: boolean;
};

const ADMIN_ROLES = ["super_admin", "system_admin"];

/** Thai labels for role codes */
const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  system_admin: "System Admin",
  dean: "คณบดี",
  dept_admin: "ผู้ดูแลแผนก",
  user: "บุคลากร",
  viewer: "ผู้ชม",
};

/* ─── Menu Data ─── */
const menuItems: MenuItem[] = [
  {
    icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
    section: "แอปพลิเคชัน",
    label: "Application Hub",
    href: "/dashboard/application-hub",
  },
  {
    icon: "M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z",
    section: "แผงควบคุม",
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: "M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2",
    section: "การจัดการโครงการ",
    label: "Projects",
    href: "/dashboard/projects",
  },
  {
    icon: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z",
    section: "ข้อมูลเอกสาร & ประกาศ",
    label: "ข้อมูลเอกสาร & ประกาศ",
    href: "/dashboard/documents",
  },
  {
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    section: "ข้อมูลบุคลากร",
    label: "บุคลากร",
    href: "/dashboard/users",
  },
  // ─── Admin Menu ───
  {
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z",
    section: "ผู้ดูแลระบบ",
    label: "จัดการ Application",
    href: "/dashboard/admin/apps",
    adminOnly: true,
  },
];

/* ─── Component ─── */
export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const userRoles: string[] = (session?.user as Record<string, unknown>)?.roles as string[] ?? [];
  const isAdmin = userRoles.some((r) => ADMIN_ROLES.includes(r));

  /** แสดงชื่อ role เป็นภาษาไทย */
  const roleLabel = userRoles.length > 0
    ? userRoles.map((r) => roleLabels[r] ?? r).join(", ")
    : "ยังไม่มีบทบาท";

  // Filter menu items based on role
  const visibleItems = menuItems.filter((item) => !item.adminOnly || isAdmin);

  async function handleLogout() {
    setIsLoggingOut(true);
    await signOut({ redirect: false });
    router.push("/login");
  }

  return (
    <aside
      className={`flex flex-col bg-[#8B1515] text-white h-screen shrink-0 transition-all duration-200 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      {/* ─── Header ─── */}
      <div className="flex items-center h-14 px-4 border-b border-white/10 shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 bg-[#FDB813] flex items-center justify-center shrink-0">
              <span className="text-[#8B1515] text-xs font-extrabold">มธ</span>
            </div>
            <div className="truncate">
              <p className="text-xs font-bold leading-tight text-[#FDB813]">TULAW</p>
              <p className="text-[10px] leading-tight text-white/70">ONE PLATFORM</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 text-white/60 hover:text-white transition-colors ${
            collapsed ? "mx-auto" : "ml-auto"
          }`}
          title={collapsed ? "ขยายเมนู" : "ย่อเมนู"}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {collapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            )}
          </svg>
        </button>
      </div>

      {/* ─── Menu Items ─── */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-5">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <div key={item.href}>
              {/* Section label */}
              {!collapsed && (
                <p className="px-4 mb-1 text-[10px] font-semibold text-[#FDB813]/80 uppercase tracking-widest">
                  {item.section}
                </p>
              )}
              <div className="px-2">
                <Link
                  href={item.href}
                  title={collapsed ? `${item.section} — ${item.label}` : undefined}
                  className={`flex items-center gap-3 rounded-sm transition-colors ${
                    collapsed ? "justify-center h-10 w-10 mx-auto" : "px-3 py-2"
                  } ${
                    isActive
                      ? "bg-[#FDB813] text-[#8B1515] font-semibold"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                  </svg>
                  {!collapsed && <span className="text-sm truncate">{item.label}</span>}
                </Link>
              </div>
            </div>
          );
        })}
      </nav>

      {/* ─── Bottom — User ─── */}
      <div className="border-t border-white/10 p-3">
        {!collapsed && (
          <div className="flex items-center gap-2 px-2 mb-2.5">
            <div className="w-8 h-8 bg-[#FDB813] flex items-center justify-center shrink-0">
              <span className="text-[#8B1515] text-xs font-bold" suppressHydrationWarning>{session?.user?.name?.charAt(0) ?? "?"}</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate" suppressHydrationWarning>{session?.user?.name ?? "ผู้ใช้งาน"}</p>
              <p className="text-[10px] text-white/60 truncate" suppressHydrationWarning>{roleLabel}</p>
            </div>
          </div>
        )}
        <Link
          href="/dashboard/settings"
          className={`flex items-center gap-3 rounded-sm transition-colors ${
            collapsed ? "justify-center h-10 w-10 mx-auto" : "px-3 py-2"
          } text-white/60 hover:bg-white/10 hover:text-white`}
          title={collapsed ? "ตั้งค่า" : undefined}
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {!collapsed && <span className="text-sm">ตั้งค่า</span>}
        </Link>

        {/* ─── Logout ─── */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`flex items-center gap-3 rounded-sm transition-colors w-full
            ${collapsed ? "justify-center h-10 w-10 mx-auto" : "px-3 py-2 mt-1"}
            text-red-300 hover:bg-red-800/50 hover:text-red-200
            disabled:opacity-50 disabled:cursor-not-allowed`}
          title={collapsed ? "ออกจากระบบ" : undefined}
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!collapsed && <span className="text-sm">{isLoggingOut ? "กำลังออก..." : "ออกจากระบบ"}</span>}
        </button>
      </div>
    </aside>
  );
}
