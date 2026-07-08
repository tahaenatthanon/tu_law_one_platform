"use client";

import { useState, useEffect } from "react";
import RequireRole from "@/components/shared/require-role";

type Employee = { id: string; name: string; position: string; department: string; employeeType: string; hireDate: string; email: string; phone: string; education: { degree: string; institution: string; major: string; year: number }[] };

export default function HrPersonnelPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Employee | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/hr/personnel")
      .then(function(r) { return r.json(); })
      .then(function(json) { if (json.success) setData(json.data); else setError(json.error?.message || "Error"); })
      .catch(function() { setError("ไม่สามารถโหลดข้อมูลได้"); })
      .finally(function() { setLoading(false); });
  }, []);

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-4 bg-gray-200 rounded w-1/3"/><div className="h-6 bg-gray-100 rounded"/></div></div>;
  if (error) return <div className="p-8 text-center"><div className="bg-[#FCE4E8] border border-[#A31D1D] p-4"><p className="text-sm text-[#A31D1D]">{error}</p></div></div>;

  const filtered = data.filter((e) => !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.department.toLowerCase().includes(search.toLowerCase()));

  return (
    <RequireRole roles={["super_admin", "system_admin", "dean", "dept_admin", "user", "viewer"]}>
      <div className="pt-0 px-6 pb-8">
        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">ประวัติบุคลากร</h1>
        <p className="text-sm text-[#6B7280] mb-6">ทะเบียนประวัติบุคลากรคณะนิติศาสตร์</p>

        <input type="text" placeholder="🔍 ค้นหาชื่อหรือแผนก..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813] mb-4" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-2">
            {filtered.map((e) => (
              <button key={e.id} onClick={() => setSelected(selected?.id === e.id ? null : e)}
                className={`w-full text-left p-3 border ${selected?.id === e.id ? "border-[#FDB813] bg-[#FEF9E7]" : "border-[#D1D5DB] bg-white hover:border-[#FDB813]"}`}>
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-[#8B1515] flex items-center justify-center text-[#FDB813] font-bold text-sm shrink-0">{e.name.charAt(0)}</div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[#1A1A2E]">{e.name}</h3>
                    <p className="text-xs text-[#6B7280]">{e.position}</p>
                    <p className="text-xs text-[#9CA3AF]">{e.department}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2">
            {selected ? (
              <div className="bg-white border border-[#D1D5DB] p-6">
                <div className="flex gap-4 mb-4">
                  <div className="w-16 h-16 bg-[#8B1515] flex items-center justify-center text-[#FDB813] font-bold text-2xl shrink-0">{selected.name.charAt(0)}</div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1A1A2E]">{selected.name}</h3>
                    <p className="text-sm text-[#6B7280]">{selected.position}</p>
                    <p className="text-xs text-[#9CA3AF]">{selected.department} · {selected.employeeType}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  {[["เริ่มงาน", selected.hireDate], ["อีเมล", selected.email], ["โทรศัพท์", selected.phone]].map(([l, v]) => (
                    <div key={l}><p className="text-xs text-[#9CA3AF]">{l}</p><p className="text-[#1A1A2E] font-medium">{v}</p></div>
                  ))}
                </div>
                <h4 className="text-sm font-semibold text-[#1A1A2E] mb-2">ประวัติการศึกษา</h4>
                <div className="space-y-2">
                  {selected.education.map((ed, i) => (
                    <div key={i} className="flex justify-between p-2 bg-[#F5F5F5] text-sm">
                      <span className="text-[#1A1A2E] font-medium">{ed.degree}</span>
                      <span className="text-[#6B7280]">{ed.major} · {ed.institution}</span>
                      <span className="text-[#9CA3AF]">{ed.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-dashed border-[#D1D5DB] flex items-center justify-center h-64">
                <p className="text-[#9CA3AF] text-sm">เลือกบุคลากรเพื่อดูรายละเอียด</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </RequireRole>
  );
}
