"use client";

import { useState, useEffect } from "react";
import RequireRole from "@/components/shared/require-role";

type Attendance = { id: string; userName: string; department: string; date: string; clockIn: string; clockOut: string; workHours: number; lateMinutes: number; status: string };
type WorkSchedule = { dayOfWeek: number; dayName: string; startTime: string; endTime: string; isActive: boolean };

const STATUS_CLASS: Record<string, string> = { present: "bg-green-100 text-green-700", late: "bg-yellow-100 text-yellow-700", absent: "bg-red-100 text-red-700" };

const SCHEDULE: WorkSchedule[] = [
  { dayOfWeek: 1, dayName: "จันทร์", startTime: "08:30", endTime: "16:30", isActive: true },
  { dayOfWeek: 2, dayName: "อังคาร", startTime: "08:30", endTime: "16:30", isActive: true },
  { dayOfWeek: 3, dayName: "พุธ", startTime: "08:30", endTime: "16:30", isActive: true },
  { dayOfWeek: 4, dayName: "พฤหัสบดี", startTime: "08:30", endTime: "16:30", isActive: true },
  { dayOfWeek: 5, dayName: "ศุกร์", startTime: "08:30", endTime: "16:30", isActive: true },
];

export default function HrAttendancePage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"attendance" | "schedule">("attendance");

  useEffect(() => {
    fetch("/api/hr/attendance")
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
        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">เวลาทำงาน</h1>
        <p className="text-sm text-[#6B7280] mb-6">บันทึกเวลาเข้า-ออกงานและตารางเวลาทำงาน</p>

        <div className="flex gap-1 bg-[#F5F5F5] p-1 rounded mb-6 w-fit">
          {(["attendance", "schedule"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium ${tab === t ? "bg-[#FDB813] text-[#1A1A2E] shadow-sm" : "text-[#6B7280] hover:text-[#1A1A2E]"}`}>
              {t === "attendance" ? "🕐 บันทึกเวลา" : "📅 ตารางเวลา"}
            </button>
          ))}
        </div>

        {tab === "schedule" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {SCHEDULE.map((s) => (
              <div key={s.dayOfWeek} className={`bg-white border p-4 ${s.isActive ? "border-[#D1D5DB]" : "border-gray-200 bg-gray-50 opacity-60"}`}>
                <p className="font-semibold text-[#1A1A2E] text-sm">{s.dayName}</p>
                <p className="text-2xl font-bold text-[#8B1515] mt-1">{s.startTime} - {s.endTime}</p>
                <span className={`text-xs mt-1 ${s.isActive ? "text-green-600" : "text-gray-400"}`}>{s.isActive ? "✓ ทำงาน" : "หยุด"}</span>
              </div>
            ))}
          </div>
        )}

        {tab === "attendance" && (
          <div className="bg-white border border-[#D1D5DB] overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#F5F5F5] text-left">
                <th className="py-3 px-4 font-medium text-[#1A1A2E]">ชื่อ</th><th className="py-3 px-4 font-medium text-[#1A1A2E]">แผนก</th>
                <th className="py-3 px-4 font-medium text-[#1A1A2E]">วันที่</th><th className="py-3 px-4 font-medium text-[#1A1A2E]">เข้า</th>
                <th className="py-3 px-4 font-medium text-[#1A1A2E]">ออก</th><th className="py-3 px-4 font-medium text-[#1A1A2E] text-right">ชม.</th>
                <th className="py-3 px-4 font-medium text-[#1A1A2E]">สาย</th><th className="py-3 px-4 font-medium text-[#1A1A2E]">สถานะ</th>
              </tr></thead>
              <tbody>
                {data.map((a) => (
                  <tr key={a.id} className="border-b border-[#F5F5F5] hover:bg-[#FEF9E7]">
                    <td className="py-2.5 px-4 text-[#1A1A2E] font-medium">{a.userName}</td>
                    <td className="py-2.5 px-4 text-[#6B7280] text-xs">{a.department}</td>
                    <td className="py-2.5 px-4 text-[#6B7280]">{a.date}</td>
                    <td className="py-2.5 px-4 text-[#1A1A2E] font-mono">{a.clockIn}</td>
                    <td className="py-2.5 px-4 text-[#1A1A2E] font-mono">{a.clockOut || "-"}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-[#1A1A2E]">{a.workHours.toFixed(1)}</td>
                    <td className="py-2.5 px-4 text-right">
                      <span className={a.lateMinutes > 0 ? "text-red-500 font-bold" : "text-green-600"}>{a.lateMinutes} นาที</span>
                    </td>
                    <td className="py-2.5 px-4"><span className={`text-xs font-medium ${STATUS_CLASS[a.status] ?? ""}`}>{a.status === "present" ? "✓" : a.status === "late" ? "สาย" : "ขาด"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </RequireRole>
  );
}
