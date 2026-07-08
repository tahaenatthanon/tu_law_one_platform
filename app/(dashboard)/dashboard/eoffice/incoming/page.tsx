"use client";

import { useState, useEffect } from "react";
import RequireRole from "@/components/shared/require-role";

const LEVEL_CLASS: Record<string, string> = {
  ปกติ: "bg-gray-100 text-gray-600", ด่วน: "bg-yellow-100 text-yellow-700", "ด่วนมาก": "bg-red-100 text-red-700", "ด่วนที่สุด": "bg-red-200 text-red-800",
};
const SECRET_CLASS: Record<string, string> = {
  ปกติ: "text-green-600", ลับ: "text-orange-600", "ลับมาก": "text-red-600", "ลับที่สุด": "text-red-700 font-bold",
};
const STATUS_CLASS: Record<string, string> = {
  "รอดำเนินการ": "bg-gray-100 text-gray-600", "กำลังดำเนินการ": "bg-yellow-100 text-yellow-700", "ดำเนินการแล้ว": "bg-green-100 text-green-700",
};

export default function EofficeIncomingPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch("/api/eoffice/incoming")
      .then(r => r.json())
      .then(json => { if (json.success) setData(json.data); else setError(json.error?.message || "Error"); })
      .catch(() => setError("ไม่สามารถโหลดข้อมูลได้"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-4 bg-gray-200 rounded w-1/3"/><div className="h-6 bg-gray-100 rounded"/></div></div>;
  if (error) return <div className="p-8 text-center"><div className="bg-[#FCE4E8] border border-[#A31D1D] p-4"><p className="text-sm text-[#A31D1D]">{error}</p></div></div>;

  const filtered = data.filter((d: any) => {
    if (filter && d.status !== filter) return false;
    return true;
  });

  return (
    <RequireRole roles={["super_admin", "system_admin", "dean", "dept_admin", "user", "viewer"]}>
      <div className="pt-0 px-6 pb-8">
        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">หนังสือเข้า</h1>
        <p className="text-sm text-[#6B7280] mb-6">ทะเบียนรับหนังสือเข้า — ลงรับและติดตามสถานะ</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "รอรับทั้งหมด", val: `${data.length} ฉบับ`, color: "#1A1A2E" },
            { label: "รอดำเนินการ", val: `${data.filter((d: any) => d.status === "รอดำเนินการ").length} ฉบับ`, color: "#FDB813" },
            { label: "กำลังดำเนินการ", val: `${data.filter((d: any) => d.status === "กำลังดำเนินการ").length} ฉบับ`, color: "#A31D1D" },
            { label: "ดำเนินการแล้ว", val: `${data.filter((d: any) => d.status === "ดำเนินการแล้ว").length} ฉบับ`, color: "#059669" },
          ].map((c, i) => (
            <button key={i} onClick={() => setFilter(filter === c.label ? "" : (c.label.includes("รอดำเนินการ") ? "รอดำเนินการ" : c.label.includes("กำลัง") ? "กำลังดำเนินการ" : c.label.includes("แล้ว") ? "ดำเนินการแล้ว" : ""))}
              className={`text-left bg-white border p-4 transition-colors ${filter && c.label.includes("รอดำเนินการ") && filter === "รอดำเนินการ" || filter && c.label.includes("กำลัง") && filter === "กำลังดำเนินการ" || filter && c.label.includes("แล้ว") && filter === "ดำเนินการแล้ว" ? "border-[#FDB813] bg-[#FEF9E7]" : "border-[#D1D5DB] hover:border-[#FDB813]"}`}>
              <p className="text-xs text-[#6B7280] mb-1">{c.label}</p>
              <p className="text-2xl font-bold" style={{ color: c.color }}>{c.val}</p>
            </button>
          ))}
        </div>

        {filter && (
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs text-[#6B7280]">ตัวกรอง: {filter}</span>
            <button onClick={() => setFilter("")} className="text-xs text-[#A31D1D] hover:underline">ล้าง</button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-[#D1D5DB] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F5F5F5] text-left">
                <th className="py-3 px-4 font-medium text-[#1A1A2E]">เลขรับ</th>
                <th className="py-3 px-4 font-medium text-[#1A1A2E]">วันที่รับ</th>
                <th className="py-3 px-4 font-medium text-[#1A1A2E]">จาก</th>
                <th className="py-3 px-4 font-medium text-[#1A1A2E]">เรื่อง</th>
                <th className="py-3 px-4 font-medium text-[#1A1A2E]">ชั้นความลับ</th>
                <th className="py-3 px-4 font-medium text-[#1A1A2E]">ความเร่งด่วน</th>
                <th className="py-3 px-4 font-medium text-[#1A1A2E]">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} onClick={() => setSelected(selected?.id === d.id ? null : d)}
                  className={`border-b border-[#F5F5F5] hover:bg-[#FEF9E7] cursor-pointer ${selected?.id === d.id ? "bg-[#FEF9E7]" : ""}`}>
                  <td className="py-2.5 px-4 text-[#A31D1D] font-medium">{d.docNo}</td>
                  <td className="py-2.5 px-4 text-[#6B7280]">{d.receivedDate}</td>
                  <td className="py-2.5 px-4 text-[#1A1A2E]">
                    <span className="font-medium">{d.senderName}</span>
                    <span className="text-xs text-[#9CA3AF] block">{d.senderOrg}</span>
                  </td>
                  <td className="py-2.5 px-4 text-[#1A1A2E] max-w-xs truncate">{d.title}</td>
                  <td className="py-2.5 px-4"><span className={`text-xs ${SECRET_CLASS[d.secretLevel] ?? "text-gray-500"}`}>🔒 {d.secretLevel}</span></td>
                  <td className="py-2.5 px-4"><span className={`text-xs px-1.5 py-0.5 rounded ${LEVEL_CLASS[d.urgentLevel] ?? ""}`}>{d.urgentLevel}</span></td>
                  <td className="py-2.5 px-4"><span className={`text-xs px-2 py-0.5 rounded ${STATUS_CLASS[d.status] ?? ""}`}>{d.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="mt-4 bg-white border border-[#FDB813] p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-[#1A1A2E] text-lg">{selected.docNo}</h3>
              <span className={`text-xs px-2 py-0.5 rounded ${STATUS_CLASS[selected.status] ?? ""}`}>{selected.status}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {[
                ["วันที่รับ", selected.receivedDate], ["ผู้ส่ง", selected.senderName],
                ["หน่วยงานผู้ส่ง", selected.senderOrg], ["เลขที่อ้างอิง", selected.refNo],
                ["เรื่อง", selected.title], ["ประเภทเอกสาร", selected.docType],
                ["ชั้นความลับ", selected.secretLevel], ["ความเร่งด่วน", selected.urgentLevel],
                ["หน่วยงานรับ", selected.departmentName], ["หมายเหตุ", selected.remark || "-"],
              ].map(([l, v], i) => (
                <div key={i}>
                  <p className="text-xs text-[#9CA3AF]">{l}</p>
                  <p className="text-[#1A1A2E] font-medium">{v}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </RequireRole>
  );
}
