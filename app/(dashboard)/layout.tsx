"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { AppHubProvider } from "@/lib/app-hub-context";
import Sidebar from "@/components/layouts/sidebar";

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin", system_admin: "System Admin",
  dean: "คณบดี", dept_admin: "ผู้ดูแลแผนก", user: "บุคลากร", viewer: "ผู้ชม",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    setDateStr(
      new Date().toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }, []);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F5F5F5]">
        <div className="animate-spin h-8 w-8 border-4 border-[#8B1515] border-t-transparent rounded-full" />
      </div>
    );
  }

  const userRoles: string[] = (session?.user as Record<string, unknown>)?.roles as string[] ?? [];
  const roleLabel = userRoles.length > 0
    ? userRoles.map((r) => roleLabels[r] ?? r).join(", ")
    : "ยังไม่มีบทบาท";

  return (
    <AppHubProvider>
      <div className="flex h-screen overflow-hidden bg-[#F5F5F5]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* ─── Top Header Bar ─── */}
          <header className="flex items-center justify-between gap-4 px-6 py-2.5 border-b border-[#E5E7EB] bg-white shrink-0">
            <div className="text-sm text-[#6B7280]">{dateStr}</div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#FDB813] rounded-full flex items-center justify-center shrink-0">
                <span className="text-[#8B1515] text-xs font-bold">{session?.user?.name?.charAt(0) ?? "?"}</span>
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-[#1A1A2E] leading-tight">{session?.user?.name ?? "ผู้ใช้งาน"}</p>
                <p className="text-[11px] text-[#6B7280] leading-tight">{roleLabel}</p>
              </div>
            </div>
          </header>

          {/* ─── Page Content ─── */}
          <main className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {children}
          </main>
        </div>
      </div>
    </AppHubProvider>
  );
}
