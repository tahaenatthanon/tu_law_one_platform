"use client";

import { useState, useEffect } from "react";
import RequireRole from "@/components/shared/require-role";

type Course = { id: string; courseCode: string; nameTh: string; nameEn: string; credits: number; lectureHours: number; labHours: number; selfStudyHours: number; prerequisites: string; description: string };

export default function AcademicCoursesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Course | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/academic/courses")
      .then(function(r) { return r.json(); })
      .then(function(json) { if (json.success) setData(json.data); else setError(json.error?.message || "Error"); })
      .catch(function() { setError("ไม่สามารถโหลดข้อมูลได้"); })
      .finally(function() { setLoading(false); });
  }, []);

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-4 bg-gray-200 rounded w-1/3"/><div className="h-6 bg-gray-100 rounded"/></div></div>;
  if (error) return <div className="p-8 text-center"><div className="bg-[#FCE4E8] border border-[#A31D1D] p-4"><p className="text-sm text-[#A31D1D]">{error}</p></div></div>;

  const filtered = data.filter((c) => !search || c.nameTh.toLowerCase().includes(search.toLowerCase()) || c.courseCode.toLowerCase().includes(search.toLowerCase()));

  return (
    <RequireRole roles={["super_admin", "system_admin", "dean", "dept_admin", "user", "viewer"]}>
      <div className="pt-0 px-6 pb-8">
        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">รายวิชา</h1>
        <p className="text-sm text-[#6B7280] mb-6">ข้อมูลรายวิชาทั้งหมดของคณะนิติศาสตร์</p>

        <input type="text" placeholder="🔍 ค้นหาด้วยรหัสหรือชื่อวิชา..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813] mb-4" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((c) => (
            <div key={c.id} onClick={() => setSelected(selected?.id === c.id ? null : c)}
              className={`bg-white border p-4 cursor-pointer transition-colors ${selected?.id === c.id ? "border-[#FDB813] bg-[#FEF9E7]" : "border-[#D1D5DB] hover:border-[#FDB813]"}`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-[#A31D1D] font-mono font-bold">{c.courseCode}</span>
                  <h3 className="text-sm font-semibold text-[#1A1A2E] mt-0.5">{c.nameTh}</h3>
                  <p className="text-xs text-[#9CA3AF]">{c.nameEn}</p>
                </div>
                <span className="text-sm font-bold text-[#8B1515]">{c.credits} หน่วยกิต</span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-[#6B7280]">
                <span>📖 บรรยาย {c.lectureHours} ชม.</span>
                {c.labHours > 0 && <span>🔬 ปฏิบัติ {c.labHours} ชม.</span>}
                <span>📚 ศึกษาด้วยตนเอง {c.selfStudyHours} ชม.</span>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div className="mt-4 bg-white border border-[#FDB813] p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-sm text-[#A31D1D] font-mono font-bold">{selected.courseCode}</span>
                <h3 className="text-lg font-bold text-[#1A1A2E]">{selected.nameTh}</h3>
                <p className="text-sm text-[#9CA3AF]">{selected.nameEn}</p>
              </div>
              <span className="text-lg font-bold text-[#8B1515]">{selected.credits} หน่วยกิต</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
              {[["บรรยาย", `${selected.lectureHours} ชม.`], ["ปฏิบัติ", `${selected.labHours} ชม.`], ["ศึกษาด้วยตนเอง", `${selected.selfStudyHours} ชม.`], ["วิชาบังคับก่อน", selected.prerequisites]].map(([l, v]) => (
                <div key={l}><p className="text-xs text-[#9CA3AF]">{l}</p><p className="text-[#1A1A2E] font-medium">{v}</p></div>
              ))}
            </div>
            <h4 className="text-sm font-semibold text-[#1A1A2E] mb-2">คำอธิบายรายวิชา</h4>
            <p className="text-sm text-[#1A1A2E] bg-[#F5F5F5] p-3 border">{selected.description}</p>
          </div>
        )}
      </div>
    </RequireRole>
  );
}
