"use client";

import { useState, useEffect } from "react";
import RequireRole from "@/components/shared/require-role";

type Meeting = {
  id: string; title: string; agenda: string; meetingDate: string; location: string;
  organizerName: string; status: string; minutesNote: string;
  attendees: { id: string; name: string; department: string; isAttended: boolean; response: string }[];
};

const STATUS_CLASS: Record<string, string> = { scheduled: "bg-blue-100 text-blue-700", completed: "bg-green-100 text-green-700", cancelled: "bg-red-100 text-red-700" };
const RESP_CLASS: Record<string, string> = { accepted: "text-green-600", declined: "text-red-500", pending: "text-yellow-600" };

export default function EofficeMeetingsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Meeting | null>(null);

  useEffect(() => {
    fetch("/api/eoffice/meetings")
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
        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">ประชุม</h1>
        <p className="text-sm text-[#6B7280] mb-6">จัดการวาระประชุม ผู้เข้าร่วม และรายงานการประชุม</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Meeting List */}
          <div className="lg:col-span-1 space-y-3">
            {data.map((m) => (
              <button key={m.id} onClick={() => setSelected(selected?.id === m.id ? null : m)}
                className={`w-full text-left p-4 border transition-colors ${
                  selected?.id === m.id ? "border-[#FDB813] bg-[#FEF9E7]" : "border-[#D1D5DB] bg-white hover:border-[#FDB813]"
                }`}>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-sm font-semibold text-[#1A1A2E] line-clamp-2">{m.title}</h3>
                </div>
                <p className="text-xs text-[#6B7280]">{m.meetingDate} น.</p>
                <p className="text-xs text-[#9CA3AF]">{m.location}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${STATUS_CLASS[m.status] ?? ""}`}>
                    {m.status === "scheduled" ? "กำหนดการ" : m.status === "completed" ? "เสร็จสิ้น" : "ยกเลิก"}
                  </span>
                  <span className="text-xs text-[#6B7280]">{m.attendees.length} คน</span>
                </div>
              </button>
            ))}
          </div>

          {/* Detail */}
          <div className="lg:col-span-2">
            {selected ? (
              <div className="bg-white border border-[#D1D5DB] p-6 space-y-4">
                <div className="flex justify-between">
                  <h3 className="font-bold text-[#1A1A2E] text-lg">{selected.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded h-fit ${STATUS_CLASS[selected.status] ?? ""}`}>
                    {selected.status === "scheduled" ? "กำหนดการ" : selected.status === "completed" ? "เสร็จสิ้น" : "ยกเลิก"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    ["วัน/เวลา", selected.meetingDate], ["สถานที่", selected.location], ["ผู้จัด", selected.organizerName],
                  ].map(([l, v]) => (
                    <div key={l}><p className="text-xs text-[#9CA3AF]">{l}</p><p className="text-[#1A1A2E] font-medium">{v}</p></div>
                  ))}
                </div>

                {/* Agenda */}
                <div>
                  <h4 className="text-sm font-semibold text-[#1A1A2E] mb-2">📋 ระเบียบวาระ</h4>
                  <pre className="text-sm text-[#1A1A2E] whitespace-pre-wrap bg-[#F5F5F5] p-3 border border-[#D1D5DB]">{selected.agenda}</pre>
                </div>

                {/* Attendees */}
                <div>
                  <h4 className="text-sm font-semibold text-[#1A1A2E] mb-2">👥 ผู้เข้าร่วม ({selected.attendees.length})</h4>
                  <div className="space-y-1.5">
                    {selected.attendees.map((a) => (
                      <div key={a.id} className="flex items-center justify-between p-2 border border-[#F5F5F5] bg-[#FAFAFA] text-sm">
                        <div>
                          <span className="text-[#1A1A2E] font-medium">{a.name}</span>
                          <span className="text-xs text-[#9CA3AF] ml-2">{a.department}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {selected.status === "completed" && (
                            <span className={a.isAttended ? "text-green-600 text-xs" : "text-red-500 text-xs"}>
                              {a.isAttended ? "✓ มาประชุม" : "✗ ขาดประชุม"}
                            </span>
                          )}
                          <span className={`text-xs ${RESP_CLASS[a.response] ?? ""}`}>
                            {a.response === "accepted" ? "ตอบรับ" : a.response === "declined" ? "ปฏิเสธ" : "รอตอบ"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Minutes (if completed) */}
                {selected.status === "completed" && selected.minutesNote && (
                  <div>
                    <h4 className="text-sm font-semibold text-[#1A1A2E] mb-2">📝 รายงานการประชุม</h4>
                    <p className="text-sm text-[#1A1A2E] bg-[#ECFDF5] border border-[#059669] p-3">{selected.minutesNote}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-dashed border-[#D1D5DB] flex items-center justify-center h-64">
                <p className="text-[#9CA3AF] text-sm">เลือกการประชุมเพื่อดูรายละเอียด</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </RequireRole>
  );
}
