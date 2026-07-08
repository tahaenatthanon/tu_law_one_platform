"use client";

import { useState, useEffect } from "react";
import RequireRole from "@/components/shared/require-role";

type Training = { id: string; title: string; description: string; trainerName: string; location: string; startDate: string; endDate: string; totalHours: number; maxAttendees: number; status: string; participants: { name: string; status: string; score: number; isAttended: boolean }[] };

export default function HrTrainingPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Training | null>(null);

  useEffect(() => {
    fetch("/api/hr/training")
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
        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">อบรม</h1>
        <p className="text-sm text-[#6B7280] mb-6">ลงทะเบียนอบรมและประวัติการอบรม</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            {data.map((t) => (
              <button key={t.id} onClick={() => setSelected(selected?.id === t.id ? null : t)}
                className={`w-full text-left p-3 border ${selected?.id === t.id ? "border-[#FDB813] bg-[#FEF9E7]" : "border-[#D1D5DB] bg-white hover:border-[#FDB813]"}`}>
                <h3 className="text-sm font-semibold text-[#1A1A2E]">{t.title}</h3>
                <p className="text-xs text-[#9CA3AF] mt-1">{t.startDate} - {t.endDate}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-1.5 py-0.5 ${t.status === "planned" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>{t.status === "planned" ? "กำลังเปิดรับ" : "เสร็จสิ้น"}</span>
                  <span className="text-xs text-[#6B7280]">{t.participants.length}/{t.maxAttendees} คน</span>
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2">
            {selected ? (
              <div className="bg-white border border-[#D1D5DB] p-6">
                <h3 className="font-bold text-[#1A1A2E] text-lg mb-1">{selected.title}</h3>
                <p className="text-xs text-[#6B7280] mb-4">{selected.trainerName} · {selected.location} · {selected.totalHours} ชม.</p>
                <p className="text-sm text-[#1A1A2E] bg-[#F5F5F5] p-3 border mb-4">{selected.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-4">
                  {[["เริ่ม", selected.startDate], ["สิ้นสุด", selected.endDate], ["จำนวน", `${selected.totalHours} ชม.`], ["รับสมัคร", `${selected.participants.length}/${selected.maxAttendees} คน`]].map(([l, v]) => (
                    <div key={l}><p className="text-xs text-[#9CA3AF]">{l}</p><p className="text-[#1A1A2E] font-medium">{v}</p></div>
                  ))}
                </div>

                <h4 className="text-sm font-semibold text-[#1A1A2E] mb-2">ผู้ลงทะเบียน ({selected.participants.length})</h4>
                <div className="space-y-1.5">
                  {selected.participants.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-[#FAFAFA] text-sm">
                      <span className="text-[#1A1A2E] font-medium">{p.name}</span>
                      <div className="flex items-center gap-2">
                        {selected.status === "completed" && p.score > 0 && <span className="text-xs text-green-600">🎯 {p.score}%</span>}
                        <span className={`text-xs px-1.5 py-0.5 ${p.status === "attended" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{p.status === "attended" ? "ผ่าน" : "ลงทะเบียน"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-dashed border-[#D1D5DB] flex items-center justify-center h-64">
                <p className="text-[#9CA3AF] text-sm">เลือกการอบรมเพื่อดูรายละเอียด</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </RequireRole>
  );
}
