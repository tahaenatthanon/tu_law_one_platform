"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useAppHub } from "@/lib/app-hub-context";
import { usePermission } from "@/hooks";
import {
  LayoutDashboard, LayoutGrid, Users, Settings, LogOut,
  ChevronsLeft, ChevronsRight, Shield, Globe,
} from "lucide-react";

type MenuItem = {
  icon: React.ReactNode;
  section: string;
  label: string;
  href: string;
  adminOnly?: boolean;
  requiredRoles?: string[];
};

const ADMIN_ROLES = ["super_admin", "system_admin"];

const iconCls = "w-5 h-5 shrink-0";

/* ─── Menu Data ─── */
const ALL_ROLES = ["super_admin", "system_admin", "dean", "dept_admin", "user", "viewer"] as const;

const menuItems: MenuItem[] = [
  // ─── หน้าหลัก ───
  {
    icon: <LayoutGrid className={iconCls} strokeWidth={2} />,
    section: "หน้าหลัก",
    label: "Application Hub",
    href: "/dashboard/application-hub",
    requiredRoles: [...ALL_ROLES],
  },
  {
    icon: <LayoutDashboard className={iconCls} strokeWidth={2} />,
    section: "หน้าหลัก",
    label: "Dashboard",
    href: "/dashboard",
    requiredRoles: [...ALL_ROLES],
  },
  {
    icon: <Globe className={iconCls} strokeWidth={2} />,
    section: "หน้าหลัก",
    label: "อินทราเน็ตคณะ",
    href: "/dashboard/intranet",
    requiredRoles: [...ALL_ROLES],
  },
  // ─── ผู้ดูแลระบบ ───
  {
    icon: <Users className={iconCls} strokeWidth={2} />,
    section: "ผู้ดูแลระบบ",
    label: "ข้อมูลบุคลากร",
    href: "/dashboard/users",
    adminOnly: true,
  },
  {
    icon: <Shield className={iconCls} strokeWidth={2} />,
    section: "ผู้ดูแลระบบ",
    label: "Audit Log",
    href: "/dashboard/audit-log",
    adminOnly: true,
  },
  {
    icon: <Settings className={iconCls} strokeWidth={2} />,
    section: "ผู้ดูแลระบบ",
    label: "ตั้งค่าระบบ",
    href: "/dashboard/system-settings",
    adminOnly: true,
  },
];

/* ─── Component ─── */
export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  async function handleLogout() {
    await signOut({ redirect: false });
    router.push("/login");
  }

  const userRoles: string[] = useMemo(() => (session?.user as Record<string, unknown>)?.roles as string[] ?? [], [session?.user]);
  const { isAdmin: isAdminFromHook } = usePermission();
  const isAdmin = userRoles.some((r) => ADMIN_ROLES.includes(r)) || isAdminFromHook;

  // ── Stats from app hub ──
  const { allApps } = useAppHub();
  const stats = useMemo(() => {
    const visible = allApps.filter((a) => {
      if (!a.allowedRoles || a.allowedRoles.length === 0) return true;
      if (userRoles.some((r) => ADMIN_ROLES.includes(r))) return true;
      return a.allowedRoles.some((r) => userRoles.includes(r));
    });
    const online = visible.filter((a) => a.status === "online").length;
    const offline = visible.filter((a) => a.status === "offline").length;
    const maint = visible.filter((a) => a.status === "maintenance").length;
    return { total: visible.length, online, offline, maint };
  }, [allApps, userRoles]);

  // Filter menu items based on role
  const visibleItems = menuItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.requiredRoles && !userRoles.some((r) => item.requiredRoles!.includes(r))) return false;
    return true;
  });

  // Group visible items by section (preserving order)
  const grouped = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const item of visibleItems) {
      const list = map.get(item.section);
      if (list) { list.push(item); }
      else { map.set(item.section, [item]); }
    }
    return Array.from(map.entries());
  }, [visibleItems]);

  const hasStatsAccess = userRoles.length > 0;

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
              <p className="text-xs font-bold leading-tight text-[#FDB813]">TU LAW</p>
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
          {collapsed ? (
            <ChevronsRight className="w-4 h-4" strokeWidth={2} />
          ) : (
            <ChevronsLeft className="w-4 h-4" strokeWidth={2} />
          )}
        </button>
      </div>

      {/* ─── Menu Items ─── */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-5 [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]">
        {grouped.map(([section, items]) => (
          <div key={section}>
            {/* Section label — shown once per section */}
            {!collapsed && (
              <p className="px-4 mb-1 text-[10px] font-semibold text-[#FDB813]/80 uppercase tracking-widest">
                {section}
              </p>
            )}
            {items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <div key={item.href} className="px-2">
                  <Link
                    href={item.href}
                    title={collapsed ? `${section} — ${item.label}` : undefined}
                    className={`flex items-center gap-3 rounded-sm transition-colors ${
                      collapsed ? "justify-center h-10 w-10 mx-auto" : "px-3 py-2"
                    } ${
                      isActive
                        ? "bg-[#FDB813] text-[#8B1515] font-semibold"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {item.icon}
                    {!collapsed && <span className="text-sm truncate">{item.label}</span>}
                  </Link>
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ─── Bottom — Stats ─── */}
      <div className="border-t border-white/10 p-3 space-y-2">
        {hasStatsAccess && (
          <>
            {!collapsed && (
              <p className="text-[10px] font-semibold text-[#FDB813]/80 uppercase tracking-widest px-1">
                สถิติ
              </p>
            )}
            {!collapsed ? (
              <div className="grid grid-cols-2 gap-1">
                {[
                  ["ระบบทั้งหมด", stats.total],
                  ["ออนไลน์", stats.online],
                  ["ออฟไลน์", stats.offline],
                  ["บำรุงรักษา", stats.maint],
                ].map(([label, val]) => (
                  <div key={label} className="bg-white/10 rounded px-2 py-1.5 text-center">
                    <p className="text-sm font-bold text-[#FDB813]">{val}</p>
                    <p className="text-[9px] text-white/50 leading-tight">{label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1.5">
                {[stats.total, stats.online, stats.offline, stats.maint].map((v, i) => (
                  <div key={i} className="text-center"><p className="text-xs font-bold text-[#FDB813]">{v}</p></div>
                ))}
              </div>
            )}
          </>
        )}
        <Link
          href="/dashboard/settings"
          className={`flex items-center gap-3 rounded-sm transition-colors ${collapsed ? "justify-center h-10 w-10 mx-auto" : "px-3 py-2"} text-white/60 hover:bg-white/10 hover:text-white`}
          title={collapsed ? "ตั้งค่า" : undefined}
        >
          <Settings className="w-5 h-5 shrink-0" strokeWidth={1.5} />
          {!collapsed && <span className="text-sm">ตั้งค่า</span>}
        </Link>

        {/* ─── Logout ─── */}
        <button
          onClick={handleLogout}
          title={collapsed ? "ออกจากระบบ" : undefined}
          className={`flex items-center gap-3 rounded-sm transition-colors ${
            collapsed ? "justify-center h-10 w-10 mx-auto" : "px-3 py-2"
          } text-white/60 hover:bg-white/10 hover:text-white`}
        >
          <LogOut className="w-5 h-5 shrink-0" strokeWidth={1.5} />
          {!collapsed && <span className="text-sm">ออกจากระบบ</span>}
        </button>
      </div>
    </aside>
  );
}
