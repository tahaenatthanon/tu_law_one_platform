"use client";

import { useState, useEffect } from "react";
import RequireRole from "@/components/shared/require-role";

type Exam = { id: string; courseCode: string; courseName: string; examType: string; examDate: string; startTime: string; endTime: string; room: string; supervisorName: string; totalStudents: number; semester: number; academicYear: number };

export default function AcademicExamPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [examType, setExamType] = useState("");

  useEffect(() => {
    fetch("/api/academic/exams")
      .then(function(r) { return r.json(); })
      .then(function(json) { if (json.success) setData(json.data); else setError(json.error?.message || "Error"); })
      .catch(function() { setError("ไม่สามารถโหลดข้อมูลได้"); })
      .finally(function() { setLoading(false); });
  }, []);

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-4 bg-gray-200 rounded w-1/3"/><div className="h-6 bg-gray-100 rounded"/></div></div>;
  if (error) return <div className="p-8 text-center"><div className="bg-[#FCE4E8] border border-[#A31D1D] p-4"><p className="text-sm text-[#A31D1D]">{error}</p></div></div>;

  const filtered = data.filter((e) => !examType || e.examType === examType);

  return (
    <RequireRole roles={["super_admin", "system_admin", "dean", "dept_admin", "user", "viewer"]}>
      <div className="pt-0 px-6 pb-8">
        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">ตารางสอบ</h1>
        <p className="text-sm text-[#6B7280] mb-6">ตารางสอบกลางภาคและปลายภาค</p>

        <div className="flex gap-2 mb-6">
          {["", "กลางภาค", "ปลายภาค"].map((t) => (
            <button key={t} onClick={() => setExamType(t)}
              className={`px-4 py-2 text-sm font-medium ${examType === t ? "bg-[#8B1515] text-white" : "bg-white text-[#6B7280] border border-[#D1D5DB]"}`}>
              {t || "ทั้งหมด"}
            </button>
          ))}
        </div>

        <div className="bg-white border border-[#D1D5DB] overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F5F5F5] text-left">
              <th className="py-3 px-4 font-medium text-[#1A1A2E]">รหัสวิชา</th><th className="py-3 px-4 font-medium text-[#1A1A2E]">รายวิชา</th>
              <th className="py-3 px-4 font-medium text-[#1A1A2E]">ประเภท</th><th className="py-3 px-4 font-medium text-[#1A1A2E]">วันที่</th>
              <th className="py-3 px-4 font-medium text-[#1A1A2E]">เวลา</th><th className="py-3 px-4 font-medium text-[#1A1A2E]">ห้อง</th>
              <th className="py-3 px-4 font-medium text-[#1A1A2E]">ผู้คุมสอบ</th><th className="py-3 px-4 font-medium text-[#1A1A2E] text-right">นศ.</th>
            </tr></thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-b border-[#F5F5F5] hover:bg-[#FEF9E7]">
                  <td className="py-2.5 px-4 text-[#A31D1D] font-medium text-xs">{e.courseCode}</td>
                  <td className="py-2.5 px-4 text-[#1A1A2E]">{e.courseName}</td>
                  <td className="py-2.5 px-4"><span className={`text-xs px-2 py-0.5 ${e.examType === "กลางภาค" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{e.examType}</span></td>
                  <td className="py-2.5 px-4 text-[#6B7280]">{e.examDate}</td>
                  <td className="py-2.5 px-4 text-[#1A1A2E] font-mono">{e.startTime}-{e.endTime}</td>
                  <td className="py-2.5 px-4 text-[#1A1A2E]">{e.room}</td>
                  <td className="py-2.5 px-4 text-[#6B7280] text-xs">{e.supervisorName}</td>
                  <td className="py-2.5 px-4 text-right text-[#1A1A2E]">{e.totalStudents}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </RequireRole>
  );
}
