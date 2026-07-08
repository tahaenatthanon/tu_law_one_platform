"use client";

import { useState, useEffect } from "react";
import RequireRole from "@/components/shared/require-role";

type Circulation = {
  id: string; title: string; senderName: string; departmentName: string;
  secretLevel: string; urgentLevel: string; isRequireAck: boolean; status: string;
  createdAt: string;
  recipients: { id: string; name: string; department: string; isRead: boolean; isAcknowledged: boolean; readAt: string }[];
};

export default function EofficeCirculationPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Circulation | null>(null);

  useEffect(() => {
    fetch("/api/eoffice/circulation")
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
        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">เวียนเอกสาร</h1>
        <p className="text-sm text-[#6B7280] mb-6">เวียนหนังสือและติดตามการรับทราบภายในหน่วยงาน</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-1 space-y-3">
            {data.map((c: Circulation) => {
              const readCount = c.recipients.filter((r: Circulation["recipients"][0]) => r.isRead).length;
              const ackCount = c.recipients.filter((r: Circulation["recipients"][0]) => r.isAcknowledged).length;
              return (
                <button key={c.id} onClick={() => setSelected(selected?.id === c.id ? null : c)}
                  className={`w-full text-left p-4 border transition-colors ${
                    selected?.id === c.id ? "border-[#FDB813] bg-[#FEF9E7]" : "border-[#D1D5DB] bg-white hover:border-[#FDB813]"
                  }`}>
                  <h3 className="text-sm font-semibold text-[#1A1A2E] line-clamp-2">{c.title}</h3>
                  <p className="text-xs text-[#9CA3AF] mt-1">{c.senderName} · {c.departmentName}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span className="text-green-600">👁️ {readCount}</span>
                    {c.isRequireAck && <span className="text-[#FDB813]">✅ {ackCount}</span>}
                    <span className="text-[#6B7280]">จาก {c.recipients.length} คน</span>
                  </div>
                  {c.urgentLevel !== "ปกติ" && (
                    <span className="inline-block mt-1.5 text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700">{c.urgentLevel}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Detail */}
          <div className="lg:col-span-2">
            {selected ? (
              <div className="bg-white border border-[#D1D5DB] p-6">
                <h3 className="font-bold text-[#1A1A2E] text-lg mb-1">{selected.title}</h3>
                <p className="text-xs text-[#6B7280] mb-4">
                  โดย {selected.senderName} · {selected.departmentName} · {selected.createdAt}
                  {selected.isRequireAck && <span className="ml-2 text-[#FDB813]">📌 ต้องรับทราบ</span>}
                </p>

                <h4 className="text-sm font-semibold text-[#1A1A2E] mb-2">รายชื่อผู้รับ ({selected.recipients.length})</h4>
                <div className="space-y-2">
                  {selected.recipients.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-3 border border-[#F5F5F5] bg-[#FAFAFA]">
                      <div>
                        <p className="text-sm font-medium text-[#1A1A2E]">{r.name}</p>
                        <p className="text-xs text-[#9CA3AF]">{r.department}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className={r.isRead ? "text-green-600" : "text-[#9CA3AF]"}>
                          {r.isRead ? `👁️ อ่านแล้ว ${r.readAt}` : "👁️ ยังไม่อ่าน"}
                        </span>
                        {selected.isRequireAck && (
                          <span className={r.isAcknowledged ? "text-[#FDB813] font-bold" : "text-[#9CA3AF]"}>
                            {r.isAcknowledged ? "✅ รับทราบแล้ว" : "⏳ รอรับทราบ"}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                {selected.isRequireAck && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-[#6B7280] mb-1">
                      <span>รับทราบแล้ว {selected.recipients.filter((r) => r.isAcknowledged).length}/{selected.recipients.length}</span>
                      <span>{Math.round((selected.recipients.filter((r) => r.isAcknowledged).length / selected.recipients.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2">
                      <div className="h-2 bg-[#FDB813]" style={{ width: `${(selected.recipients.filter((r) => r.isAcknowledged).length / selected.recipients.length) * 100}%` }} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-dashed border-[#D1D5DB] flex items-center justify-center h-64">
                <p className="text-[#9CA3AF] text-sm">เลือกเอกสารเวียนเพื่อดูรายละเอียด</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </RequireRole>
  );
}
