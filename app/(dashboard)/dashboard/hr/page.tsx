"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import RequireRole from "@/components/shared/require-role";
import { Users, Clock, ClipboardCheck, GraduationCap } from "lucide-react";

export default function HrDashboardPage() {
  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as any)?.roles ?? [];
  const isStaff = userRoles.some((r: string) => ["super_admin","system_admin","dean","dept_admin"].includes(r));
  const [stats, setStats] = useState({ totalPersonnel: 0, presentToday: 0, pendingLeaves: 0, trainingCount: 0 });

  useEffect(() => {
    Promise.all([
      fetch("/api/hr/personnel").then(r => r.json()),
      fetch("/api/leave?status=pending").then(r => r.json()),
      fetch("/api/hr/training").then(r => r.json()),
    ]).then(([p, l, t]) => {
      if (p.success) setStats(s => ({ ...s, totalPersonnel: p.meta?.total ?? p.data?.length ?? 0 }));
      if (l.success) setStats(s => ({ ...s, pendingLeaves: l.meta?.total ?? l.data?.length ?? 0 }));
      if (t.success) {
        const upcoming = (t.data || []).filter((tr: any) => tr.status === "เปิดรับสมัคร");
        setStats(s => ({ ...s, trainingCount: upcoming.length }));
      }
    }).catch(() => {});
    setStats(s => ({ ...s, presentToday: 42 }));
  }, []);

  const modules = [
    { label: "ประวัติบุคลากร", desc: "ดูและจัดการข้อมูลบุคลากร", icon: Users, href: "/dashboard/hr/personnel", color: "text-[#A31D1D]" },
    { label: "การลงเวลา", desc: "บันทึกเวลาเข้า-ออกงาน", icon: Clock, href: "/dashboard/hr/attendance", color: "text-[#1A1A2E]" },
    { label: "ประเมินผล", desc: "ดูผลการประเมินการทำงาน", icon: ClipboardCheck, href: "/dashboard/hr/evaluation", color: "text-[#059669]" },
    { label: "อบรม", desc: "หลักสูตรฝึกอบรมและพัฒนา", icon: GraduationCap, href: "/dashboard/hr/training", color: "text-[#4A90D9]" },
  ];

  return (
    <RequireRole roles={["super_admin","system_admin","dean","dept_admin","user","viewer"]}>
    <div className="pt-0 px-6 pb-8">
      <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">บริหารทรัพยากรบุคคล (HR)</h1>
      <p className="text-sm text-[#6B7280] mb-6">ระบบบริหารบุคลากร — จัดการข้อมูลพนักงาน เวลาทำงาน การลา การประเมินผล และการอบรม</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[{ label: "บุคลากรทั้งหมด", value: stats.totalPersonnel, color: "text-[#1A1A2E]" }, { label: "เข้าแถววันนี้", value: stats.presentToday, color: "text-[#059669]" }, { label: "รออนุมัติลา", value: stats.pendingLeaves, color: "text-yellow-600" }, { label: "เปิดอบรม", value: stats.trainingCount, color: "text-[#4A90D9]" }].map(s => (
          <div key={s.label} className="bg-white border border-[#D1D5DB] p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-[#6B7280] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map(m => (
          <Link key={m.href} href={m.href} className="bg-white border border-[#D1D5DB] p-5 hover:border-[#FDB813] transition-colors group">
            <div className="flex items-start gap-4">
              <div className={`p-2 bg-[#F5F5F5] ${m.color}`}><m.icon className="size-5" /></div>
              <div>
                <h3 className="text-sm font-bold text-[#1A1A2E] group-hover:text-[#A31D1D] transition-colors">{m.label}</h3>
                <p className="text-xs text-[#6B7280] mt-0.5">{m.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
    </RequireRole>
  );
}
