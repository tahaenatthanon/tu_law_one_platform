"use client";

import { useState, useEffect } from "react";
import RequireRole from "@/components/shared/require-role";
import { useSession } from "next-auth/react";

export default function UsersPage() {
  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as any)?.roles ?? [];
  const isAdmin = userRoles.some((r: string) => ["super_admin", "system_admin"].includes(r));

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/hr/personnel")
      .then(r => r.json())
      .then(json => { if (json.success) setData(json.data); else setError(json.error?.message || "Error"); })
      .catch(() => setError("ไม่สามารถโหลดข้อมูลบุคลากรได้"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="pt-0 px-6 pb-8">
      <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">บุคลากร</h1>
      <p className="text-sm text-[#6B7280] mb-6">ข้อมูลบุคลากรคณะนิติศาสตร์</p>
      <div className="animate-pulse space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-14 bg-gray-100"/>)}</div>
    </div>
  );
  if (error) return (
    <div className="pt-0 px-6 pb-8">
      <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">บุคลากร</h1>
      <p className="text-sm text-[#6B7280] mb-6">ข้อมูลบุคลากรคณะนิติศาสตร์</p>
      <div className="bg-[#FCE4E8] border border-[#A31D1D] p-4 text-sm text-[#A31D1D]">{error}</div>
    </div>
  );

  const roleLabels: Record<string, string> = { super_admin: "Super Admin", system_admin: "System Admin", dean: "คณบดี", dept_admin: "ผู้ดูแลแผนก", user: "บุคลากร", viewer: "ผู้ชม" };

  return (
    <RequireRole roles={["super_admin", "system_admin", "dean", "dept_admin", "user"]}>
      <div className="pt-0 px-6 pb-8">
        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">บุคลากร</h1>
        <p className="text-sm text-[#6B7280] mb-6">ข้อมูลบุคลากรคณะนิติศาสตร์ — จัดการรายชื่อ บทบาท และสถานะผู้ใช้งานในระบบ · {data.length} คน</p>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-white border border-[#D1D5DB] px-4 py-2 text-center">
              <p className="text-xl font-bold text-[#1A1A2E]">{data.length}</p>
              <p className="text-[10px] text-[#6B7280]">บุคลากรทั้งหมด</p>
            </div>
            <div className="bg-white border border-[#D1D5DB] px-4 py-2 text-center">
              <p className="text-xl font-bold text-[#059669]">{data.filter((u: any) => u.user?.status === "ACTIVE").length}</p>
              <p className="text-[10px] text-[#6B7280]">ใช้งานอยู่</p>
            </div>
          </div>
          {isAdmin && <button className="px-4 py-2 text-sm font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800]">+ เพิ่มผู้ใช้</button>}
        </div>

        <div className="bg-white border border-[#D1D5DB] overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F5F5F5] text-left"><th className="py-2.5 px-4 font-medium text-[#1A1A2E]">ชื่อ-นามสกุล</th><th className="py-2.5 px-4 font-medium text-[#1A1A2E] hidden md:table-cell">อีเมล</th><th className="py-2.5 px-4 font-medium text-[#1A1A2E] hidden md:table-cell">ฝ่าย</th><th className="py-2.5 px-4 font-medium text-[#1A1A2E] hidden lg:table-cell">บทบาท</th><th className="py-2.5 px-4 font-medium text-[#1A1A2E]">สถานะ</th></tr></thead>
            <tbody>
              {data.map((u: any) => (
                <tr key={u.id} className="border-t border-[#F5F5F5] hover:bg-[#FEF9E7] transition-colors">
                  <td className="py-2.5 px-4">
                    <p className="font-medium text-[#1A1A2E]">{u.user?.firstNameTh} {u.user?.lastNameTh}</p>
                    <p className="text-[10px] text-[#9CA3AF]">{u.employeeCode || "-"}</p>
                  </td>
                  <td className="py-2.5 px-4 text-[#6B7280] hidden md:table-cell">{u.user?.email || "-"}</td>
                  <td className="py-2.5 px-4 text-[#6B7280] hidden md:table-cell">{u.user?.department?.name || "-"}</td>
                  <td className="py-2.5 px-4 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(u.user?.userRoles || []).map((ur: any) => (
                        <span key={ur.id} className="text-[10px] px-1.5 py-0.5 bg-[#F5F5F5] text-[#6B7280]">{roleLabels[ur.role?.roleCode] || ur.role?.roleCode}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 px-4"><span className={`text-[11px] font-medium px-2 py-0.5 ${u.user?.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{u.user?.status === "ACTIVE" ? "ใช้งาน" : "ไม่ใช้งาน"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </RequireRole>
  );
}
