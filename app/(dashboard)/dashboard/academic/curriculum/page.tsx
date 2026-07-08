"use client";

import { useState, useEffect } from "react";
import RequireRole from "@/components/shared/require-role";

type Curriculum = { id: string; code: string; nameTh: string; degreeLevel: string; totalCredits: number; yearEffective: number; status: string; description: string };
type Course = { id: string; courseCode: string; nameTh: string; credits: number; courseGroup: string; isRequired: boolean; yearLevel: number; semester: number };

const data_COURSES: Record<string, Course[]> = {
  "curr-1": [
    { id: "c-1", courseCode: "น.101", nameTh: "กฎหมายแพ่ง: หลักทั่วไป", credits: 3, courseGroup: "วิชาเฉพาะบังคับ", isRequired: true, yearLevel: 1, semester: 1 },
    { id: "c-2", courseCode: "น.102", nameTh: "กฎหมายอาญา: ภาคทั่วไป", credits: 3, courseGroup: "วิชาเฉพาะบังคับ", isRequired: true, yearLevel: 1, semester: 1 },
    { id: "c-3", courseCode: "น.103", nameTh: "นิติศาสตร์เบื้องต้น", credits: 2, courseGroup: "วิชาเฉพาะบังคับ", isRequired: true, yearLevel: 1, semester: 1 },
    { id: "c-4", courseCode: "น.201", nameTh: "กฎหมายรัฐธรรมนูญ", credits: 3, courseGroup: "วิชาเฉพาะบังคับ", isRequired: true, yearLevel: 2, semester: 1 },
    { id: "c-5", courseCode: "น.301", nameTh: "กฎหมายระหว่างประเทศ", credits: 3, courseGroup: "วิชาเฉพาะเลือก", isRequired: false, yearLevel: 3, semester: 1 },
  ],
};

export default function AcademicCurriculumPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Curriculum | null>(null);

  useEffect(() => {
    fetch("/api/academic/curriculum")
      .then(function(r) { return r.json(); })
      .then(function(json) { if (json.success) setData(json.data); else setError(json.error?.message || "Error"); })
      .catch(function() { setError("ไม่สามารถโหลดข้อมูลได้"); })
      .finally(function() { setLoading(false); });
  }, []);

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-4 bg-gray-200 rounded w-1/3"/><div className="h-6 bg-gray-100 rounded"/></div></div>;
  if (error) return <div className="p-8 text-center"><div className="bg-[#FCE4E8] border border-[#A31D1D] p-4"><p className="text-sm text-[#A31D1D]">{error}</p></div></div>;

  return (
    <RequireRole roles={["super_admin", "system_admin", "dean", "dept_admin", "user", "viewer"]}>
      <div className="pt-0 px-6 pb-8">
        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">หลักสูตร</h1>
        <p className="text-sm text-[#6B7280] mb-6">จัดการหลักสูตรและโครงสร้างหลักสูตรของคณะ</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            {data.map((c) => (
              <button key={c.id} onClick={() => setSelected(selected?.id === c.id ? null : c)}
                className={`w-full text-left p-4 border transition-colors ${selected?.id === c.id ? "border-[#FDB813] bg-[#FEF9E7]" : "border-[#D1D5DB] bg-white hover:border-[#FDB813]"}`}>
                <h3 className="font-semibold text-[#1A1A2E] text-sm">{c.nameTh}</h3>
                <p className="text-xs text-[#9CA3AF] mt-1">{c.code} · {c.degreeLevel} · {c.totalCredits} หน่วยกิต</p>
                <span className={`inline-block mt-2 text-xs px-2 py-0.5 ${c.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {c.status === "active" ? "ใช้งาน" : "ปิด"}
                </span>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2">
            {selected ? (
              <div className="bg-white border border-[#D1D5DB] p-6">
                <h3 className="font-bold text-[#1A1A2E] text-lg mb-1">{selected.nameTh}</h3>
                <p className="text-xs text-[#6B7280] mb-4">{selected.code} · {selected.degreeLevel} · {selected.totalCredits} หน่วยกิต · ปี {selected.yearEffective}</p>
                <p className="text-sm text-[#1A1A2E] bg-[#F5F5F5] p-3 border mb-4">{selected.description}</p>

                <h4 className="font-semibold text-[#1A1A2E] text-sm mb-2">โครงสร้างหลักสูตร</h4>
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F5] text-left">
                    <th className="py-2 px-3 font-medium text-[#1A1A2E]">รหัส</th><th className="py-2 px-3 font-medium text-[#1A1A2E]">รายวิชา</th>
                    <th className="py-2 px-3 font-medium text-[#1A1A2E]">หน่วยกิต</th><th className="py-2 px-3 font-medium text-[#1A1A2E]">กลุ่ม</th>
                    <th className="py-2 px-3 font-medium text-[#1A1A2E]">ชั้นปี</th>
                  </tr></thead>
                  <tbody>
                    {(data_COURSES[selected.id] || []).map((c: Course) => (
                      <tr key={c.id} className="border-b border-[#F5F5F5]">
                        <td className="py-2 px-3 text-[#A31D1D] font-medium text-xs">{c.courseCode}</td>
                        <td className="py-2 px-3 text-[#1A1A2E]">{c.nameTh}</td>
                        <td className="py-2 px-3 text-[#6B7280]">{c.credits}</td>
                        <td className="py-2 px-3"><span className={`text-xs px-1.5 py-0.5 ${c.isRequired ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}>{c.courseGroup}</span></td>
                        <td className="py-2 px-3 text-[#6B7280]">ปี {c.yearLevel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white border border-dashed border-[#D1D5DB] flex items-center justify-center h-64">
                <p className="text-[#9CA3AF] text-sm">เลือกหลักสูตรเพื่อดูรายละเอียด</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </RequireRole>
  );
}
