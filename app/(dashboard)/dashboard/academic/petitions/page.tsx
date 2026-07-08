"use client";

import { useState, useEffect } from "react";
import RequireRole from "@/components/shared/require-role";

type Petition = { id: string; typeName: string; subject: string; detail: string; requesterName: string; status: string; semester: number; academicYear: number; approverName: string; approvedAt: string; rejectedReason: string; createdAt: string };

const STATUS_CLASS: Record<string, string> = { pending: "bg-yellow-100 text-yellow-700", approved: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700" };

export default function AcademicPetitionsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Petition | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetch("/api/academic/petitions")
      .then(function(r) { return r.json(); })
      .then(function(json) { if (json.success) setData(json.data); else setError(json.error?.message || "Error"); })
      .catch(function() { setError("ไม่สามารถโหลดข้อมูลได้"); })
      .finally(function() { setLoading(false); });
  }, []);

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-4 bg-gray-200 rounded w-1/3"/><div className="h-6 bg-gray-100 rounded"/></div></div>;
  if (error) return <div className="p-8 text-center"><div className="bg-[#FCE4E8] border border-[#A31D1D] p-4"><p className="text-sm text-[#A31D1D]">{error}</p></div></div>;

  const filtered = data.filter((p) => !statusFilter || p.status === statusFilter);

  return (
    <RequireRole roles={["super_admin", "system_admin", "dean", "dept_admin", "user", "viewer"]}>
      <div className="pt-0 px-6 pb-8">
        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">คำร้อง</h1>
        <p className="text-sm text-[#6B7280] mb-6">ยื่นและติดตามคำร้องออนไลน์</p>

        <div className="flex gap-2 mb-6">
          {["", "pending", "approved", "rejected"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 text-sm font-medium ${statusFilter === s ? "bg-[#8B1515] text-white" : "bg-white text-[#6B7280] border border-[#D1D5DB]"}`}>
              {s === "" ? "ทั้งหมด" : s === "pending" ? "⏳ รอดำเนินการ" : s === "approved" ? "✅ อนุมัติ" : "❌ ปฏิเสธ"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            {filtered.map((p) => (
              <button key={p.id} onClick={() => setSelected(selected?.id === p.id ? null : p)}
                className={`w-full text-left p-3 border transition-colors ${selected?.id === p.id ? "border-[#FDB813] bg-[#FEF9E7]" : "border-[#D1D5DB] bg-white hover:border-[#FDB813]"}`}>
                <div className="flex justify-between items-start">
                  <span className="text-xs text-[#9CA3AF]">{p.typeName}</span>
                  <span className={`text-xs px-1.5 py-0.5 ${STATUS_CLASS[p.status] ?? ""}`}>{p.status === "pending" ? "รอ" : p.status === "approved" ? "อนุมัติ" : "ปฏิเสธ"}</span>
                </div>
                <h3 className="text-sm font-semibold text-[#1A1A2E] mt-1">{p.subject}</h3>
                <p className="text-xs text-[#9CA3AF] mt-1">{p.requesterName} · {p.createdAt}</p>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2">
            {selected ? (
              <div className="bg-white border border-[#D1D5DB] p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs text-[#9CA3AF]">{selected.typeName}</span>
                    <h3 className="font-bold text-[#1A1A2E] text-lg">{selected.subject}</h3>
                    <p className="text-xs text-[#6B7280]">ผู้ยื่น: {selected.requesterName} · {selected.createdAt}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_CLASS[selected.status] ?? ""}`}>
                    {selected.status === "pending" ? "รอดำเนินการ" : selected.status === "approved" ? "อนุมัติแล้ว" : "ปฏิเสธ"}
                  </span>
                </div>
                <div className="bg-[#F5F5F5] p-3 border text-sm text-[#1A1A2E] mb-4 whitespace-pre-wrap">{selected.detail}</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[["ภาคการศึกษา", `${selected.semester}/${selected.academicYear}`], ["ผู้อนุมัติ", selected.approverName || "-"], ["วันที่อนุมัติ", selected.approvedAt || "-"], ["เหตุผลการปฏิเสธ", selected.rejectedReason || "-"]].map(([l, v]) => (
                    <div key={l}><p className="text-xs text-[#9CA3AF]">{l}</p><p className="text-[#1A1A2E] font-medium">{v}</p></div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-dashed border-[#D1D5DB] flex items-center justify-center h-64">
                <p className="text-[#9CA3AF] text-sm">เลือกคำร้องเพื่อดูรายละเอียด</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </RequireRole>
  );
}
