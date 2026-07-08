"use client";

import { useState, useEffect } from "react";
import RequireRole from "@/components/shared/require-role";

type Schedule = { id: string; courseCode: string; courseName: string; section: string; instructor: string; room: string; studyDay: string; startTime: string; endTime: string; semester: number; academicYear: number; maxSeats: number; enrolledSeats: number };

const DAYS = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"];
const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
const FMT = (t: string) => t;

export default function AcademicSchedulePage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selected, setSelected] = useState<Schedule | null>(null);

  useEffect(() => {
    fetch("/api/academic/schedule")
      .then(function(r) { return r.json(); })
      .then(function(json) { if (json.success) setData(json.data); else setError(json.error?.message || "Error"); })
      .catch(function() { setError("ไม่สามารถโหลดข้อมูลได้"); })
      .finally(function() { setLoading(false); });
  }, []);

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-4 bg-gray-200 rounded w-1/3"/><div className="h-6 bg-gray-100 rounded"/></div></div>;
  if (error) return <div className="p-8 text-center"><div className="bg-[#FCE4E8] border border-[#A31D1D] p-4"><p className="text-sm text-[#A31D1D]">{error}</p></div></div>;

  const filtered = data.filter((s) => !selectedDay || s.studyDay === selectedDay);

  return (
    <RequireRole roles={["super_admin", "system_admin", "dean", "dept_admin", "user", "viewer"]}>
      <div className="pt-0 px-6 pb-8">
        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">ตารางเรียน</h1>
        <p className="text-sm text-[#6B7280] mb-6">ตารางเรียนภาคการศึกษาที่ 1/2569</p>

        <div className="flex gap-2 mb-6 flex-wrap">
          <button onClick={() => setSelectedDay("")} className={`px-3 py-1.5 text-xs font-medium ${!selectedDay ? "bg-[#8B1515] text-white" : "bg-white text-[#6B7280] border border-[#D1D5DB]"}`}>ทั้งหมด</button>
          {DAYS.map((d) => (
            <button key={d} onClick={() => setSelectedDay(d)} className={`px-3 py-1.5 text-xs font-medium ${selectedDay === d ? "bg-[#8B1515] text-white" : "bg-white text-[#6B7280] border border-[#D1D5DB]"}`}>{d}</button>
          ))}
        </div>

        <div className="bg-white border border-[#D1D5DB] overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="bg-[#F5F5F5]">
                <th className="py-3 px-4 font-medium text-[#1A1A2E] text-left w-20">เวลา / วัน</th>
                {DAYS.map((d) => <th key={d} className="py-3 px-2 font-medium text-[#1A1A2E] text-center border-l">{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((time, ti) => (
                <tr key={time} className="border-t border-[#F5F5F5]">
                  <td className="py-3 px-4 text-xs text-[#6B7280] font-mono">{FMT(time)}</td>
                  {DAYS.map((day) => {
                    const match = data.find((s) => s.studyDay === day && s.startTime === time && (!selectedDay || s.studyDay === selectedDay));
                    return (
                      <td key={day} className={`py-1 px-1 border-l border-[#F5F5F5] text-center align-top ${match ? "" : ""}`}>
                        {match && (
                          <button onClick={() => setSelected(selected?.id === match.id ? null : match)}
                            className={`w-full text-left p-1.5 text-xs rounded transition-colors ${
                              selected?.id === match.id ? "bg-[#FDB813] text-[#1A1A2E]" :
                              match.enrolledSeats >= match.maxSeats ? "bg-red-50 text-red-700 hover:bg-red-100" :
                              "bg-[#FEF9E7] text-[#1A1A2E] hover:bg-[#FDB813]/20"
                            }`}>
                            <p className="font-bold text-[10px]">{match.courseCode}</p>
                            <p className="text-[9px] truncate">{match.courseName}</p>
                            <p className="text-[9px] text-[#6B7280]">Sec.{match.section} | {match.room}</p>
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="mt-4 bg-white border border-[#FDB813] p-4 flex flex-wrap gap-4 text-sm">
            <div><p className="text-xs text-[#9CA3AF]">วิชา</p><p className="font-bold text-[#1A1A2E]">{selected.courseCode} {selected.courseName}</p></div>
            <div><p className="text-xs text-[#9CA3AF]">Section</p><p className="font-medium">{selected.section}</p></div>
            <div><p className="text-xs text-[#9CA3AF]">อาจารย์</p><p className="font-medium">{selected.instructor}</p></div>
            <div><p className="text-xs text-[#9CA3AF]">ห้อง</p><p className="font-medium">{selected.room}</p></div>
            <div><p className="text-xs text-[#9CA3AF]">เวลา</p><p className="font-medium">{selected.studyDay} {FMT(selected.startTime)}-{FMT(selected.endTime)}</p></div>
            <div><p className="text-xs text-[#9CA3AF]">ที่นั่ง</p><p className={`font-medium ${selected.enrolledSeats >= selected.maxSeats ? "text-red-500" : "text-green-600"}`}>{selected.enrolledSeats}/{selected.maxSeats}</p></div>
          </div>
        )}
      </div>
    </RequireRole>
  );
}
