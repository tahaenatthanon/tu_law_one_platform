"use client";

import { useState, useEffect } from "react";
import RequireRole from "@/components/shared/require-role";

type OutgoingDoc = {
  id: string; docNo: string; sentDate: string; receiverName: string; receiverOrg: string;
  title: string; secretLevel: string; urgentLevel: string; docType: string;
  status: string; remark: string; creatorName: string; departmentName: string;
};

const STATUS_CLASS: Record<string, string> = { draft: "bg-gray-100 text-gray-600", sent: "bg-blue-100 text-blue-700", received: "bg-green-100 text-green-700" };

export default function EofficeOutgoingPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<OutgoingDoc | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch("/api/eoffice/outgoing")
      .then(function(r) { return r.json(); })
      .then(function(json) { if (json.success) setData(json.data); else setError(json.error?.message || "Error"); })
      .catch(function() { setError("ไม่สามารถโหลดข้อมูลได้"); })
      .finally(function() { setLoading(false); });
  }, []);

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-4 bg-gray-200 rounded w-1/3"/><div className="h-6 bg-gray-100 rounded"/></div></div>;
  if (error) return <div className="p-8 text-center"><div className="bg-[#FCE4E8] border border-[#A31D1D] p-4"><p className="text-sm text-[#A31D1D]">{error}</p></div></div>;

  const filtered = data.filter((d) => !filter || d.status === filter);

  return (
    <RequireRole roles={["super_admin", "system_admin", "dean", "dept_admin", "user", "viewer"]}>
      <div className="pt-0 px-6 pb-8">
        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">หนังสือออก</h1>
        <p className="text-sm text-[#6B7280] mb-6">ทะเบียนหนังสือออก — ออกเลขและติดตามการส่ง</p>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "ทั้งหมด", val: `${data.length} ฉบับ`, filterVal: "", color: "#1A1A2E" },
            { label: "ร่าง", val: `${data.filter((d) => d.status === "ร่าง").length} ฉบับ`, filterVal: "ร่าง", color: "#6B7280" },
            { label: "รอลงนาม", val: `${data.filter((d) => d.status === "รอลงนาม").length} ฉบับ`, filterVal: "รอลงนาม", color: "#FDB813" },
            { label: "ส่งแล้ว", val: `${data.filter((d) => d.status === "ส่งแล้ว").length} ฉบับ`, filterVal: "ส่งแล้ว", color: "#059669" },
          ].map((c, i) => (
            <button key={i} onClick={() => setFilter(c.filterVal)}
              className={`text-left bg-white border p-4 transition-colors ${filter === c.filterVal ? "border-[#FDB813] bg-[#FEF9E7]" : "border-[#D1D5DB] hover:border-[#FDB813]"}`}>
              <p className="text-xs text-[#6B7280] mb-1">{c.label}</p>
              <p className="text-2xl font-bold" style={{ color: c.color }}>{c.val}</p>
            </button>
          ))}
        </div>

        <div className="bg-white border border-[#D1D5DB] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F5F5F5] text-left">
                <th className="py-3 px-4 font-medium text-[#1A1A2E]">เลขออก</th>
                <th className="py-3 px-4 font-medium text-[#1A1A2E]">วันที่</th>
                <th className="py-3 px-4 font-medium text-[#1A1A2E]">ถึง</th>
                <th className="py-3 px-4 font-medium text-[#1A1A2E]">เรื่อง</th>
                <th className="py-3 px-4 font-medium text-[#1A1A2E]">ประเภท</th>
                <th className="py-3 px-4 font-medium text-[#1A1A2E]">ผู้จัดทำ</th>
                <th className="py-3 px-4 font-medium text-[#1A1A2E]">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} onClick={() => setSelected(selected?.id === d.id ? null : d)}
                  className={`border-b border-[#F5F5F5] hover:bg-[#FEF9E7] cursor-pointer ${selected?.id === d.id ? "bg-[#FEF9E7]" : ""}`}>
                  <td className="py-2.5 px-4 text-[#A31D1D] font-medium">{d.docNo}</td>
                  <td className="py-2.5 px-4 text-[#6B7280]">{d.sentDate}</td>
                  <td className="py-2.5 px-4 text-[#1A1A2E]">
                    <span className="font-medium">{d.receiverName}</span>
                    <span className="text-xs text-[#9CA3AF] block">{d.receiverOrg}</span>
                  </td>
                  <td className="py-2.5 px-4 text-[#1A1A2E] max-w-xs truncate">{d.title}</td>
                  <td className="py-2.5 px-4 text-[#6B7280] text-xs">{d.docType}</td>
                  <td className="py-2.5 px-4 text-[#1A1A2E]">{d.creatorName}</td>
                  <td className="py-2.5 px-4"><span className={`text-xs px-2 py-0.5 rounded ${STATUS_CLASS[d.status] ?? ""}`}>{d.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="mt-4 bg-white border border-[#FDB813] p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-[#1A1A2E] text-lg">{selected.docNo}</h3>
              <span className={`text-xs px-2 py-0.5 rounded ${STATUS_CLASS[selected.status] ?? ""}`}>{selected.status}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {[
                ["วันที่ส่ง", selected.sentDate], ["ผู้รับ", selected.receiverName],
                ["หน่วยงานผู้รับ", selected.receiverOrg], ["เรื่อง", selected.title],
                ["ประเภทเอกสาร", selected.docType], ["ชั้นความลับ", selected.secretLevel],
                ["ความเร่งด่วน", selected.urgentLevel], ["ผู้จัดทำ", selected.creatorName],
                ["แผนก", selected.departmentName], ["หมายเหตุ", selected.remark || "-"],
              ].map(([l, v], i) => (
                <div key={i}><p className="text-xs text-[#9CA3AF]">{l}</p><p className="text-[#1A1A2E] font-medium">{v}</p></div>
              ))}
            </div>
          </div>
        )}
      </div>
    </RequireRole>
  );
}
