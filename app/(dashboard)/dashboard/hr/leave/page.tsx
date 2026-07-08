"use client";

import { useState, useEffect } from "react";
import RequireRole from "@/components/shared/require-role";

type Leave = { id: string; userName: string; department: string; leaveType: string; startDate: string; endDate: string; totalDays: number; reason: string; status: string; approverName: string; createdAt: string };

const STATUS_CLASS: Record<string, string> = { pending: "bg-yellow-100 text-yellow-700", approved: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700" };

const LEAVE_BALANCE = [
  { leaveType: "ลาป่วย", total: 30, used: 3, remain: 27 },
  { leaveType: "ลากิจ", total: 15, used: 5, remain: 10 },
  { leaveType: "ลาพักผ่อน", total: 10, used: 2, remain: 8 },
];

export default function HrLeavePage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"list" | "balance">("list");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetch("/api/hr/leave")
      .then(function(r) { return r.json(); })
      .then(function(json) { if (json.success) setData(json.data); else setError(json.error?.message || "Error"); })
      .catch(function() { setError("ไม่สามารถโหลดข้อมูลได้"); })
      .finally(function() { setLoading(false); });
  }, []);

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-4 bg-gray-200 rounded w-1/3"/><div className="h-6 bg-gray-100 rounded"/></div></div>;
  if (error) return <div className="p-8 text-center"><div className="bg-[#FCE4E8] border border-[#A31D1D] p-4"><p className="text-sm text-[#A31D1D]">{error}</p></div></div>;

  const filtered = data.filter((l) => !statusFilter || l.status === statusFilter);

  return (
    <RequireRole roles={["super_admin", "system_admin", "dean", "dept_admin", "user", "viewer"]}>
      <div className="pt-0 px-6 pb-8">
        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">ลา</h1>
        <p className="text-sm text-[#6B7280] mb-6">ยื่นคำขอลาและติดตามสถานะ</p>

        <div className="flex gap-1 bg-[#F5F5F5] p-1 rounded mb-6 w-fit">
          {(["list", "balance"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium ${tab === t ? "bg-[#FDB813] text-[#1A1A2E] shadow-sm" : "text-[#6B7280] hover:text-[#1A1A2E]"}`}>
              {t === "list" ? "📋 รายการลา" : "📊 ยอดคงเหลือ"}
            </button>
          ))}
        </div>

        {tab === "balance" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {LEAVE_BALANCE.map((b) => (
              <div key={b.leaveType} className="bg-white border border-[#D1D5DB] p-4">
                <p className="text-xs text-[#6B7280] mb-1">{b.leaveType}</p>
                <p className="text-2xl font-bold text-green-600">{b.remain}</p>
                <p className="text-xs text-[#9CA3AF]">จาก {b.total} วัน · ใช้ไป {b.used} วัน</p>
              </div>
            ))}
          </div>
        )}

        {tab === "list" && (
          <>
            <div className="flex gap-2 mb-4">
              {["", "pending", "approved", "rejected"].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 text-xs font-medium ${statusFilter === s ? "bg-[#8B1515] text-white" : "bg-white text-[#6B7280] border border-[#D1D5DB]"}`}>
                  {s === "" ? "ทั้งหมด" : s === "pending" ? "รออนุมัติ" : s === "approved" ? "อนุมัติ" : "ปฏิเสธ"}
                </button>
              ))}
            </div>
            <div className="bg-white border border-[#D1D5DB] overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-[#F5F5F5] text-left">
                  <th className="py-3 px-4 font-medium text-[#1A1A2E]">ผู้ขอ</th><th className="py-3 px-4 font-medium text-[#1A1A2E]">ประเภท</th>
                  <th className="py-3 px-4 font-medium text-[#1A1A2E]">วันที่</th><th className="py-3 px-4 font-medium text-[#1A1A2E]">จำนวนวัน</th>
                  <th className="py-3 px-4 font-medium text-[#1A1A2E]">เหตุผล</th><th className="py-3 px-4 font-medium text-[#1A1A2E]">สถานะ</th>
                </tr></thead>
                <tbody>
                  {filtered.map((l) => (
                    <tr key={l.id} className="border-b border-[#F5F5F5] hover:bg-[#FEF9E7]">
                      <td className="py-2.5 px-4 text-[#1A1A2E] font-medium">{l.userName}<span className="text-xs text-[#9CA3AF] block">{l.department}</span></td>
                      <td className="py-2.5 px-4 text-[#6B7280]">{l.leaveType}</td>
                      <td className="py-2.5 px-4 text-[#6B7280]">{l.startDate} - {l.endDate}</td>
                      <td className="py-2.5 px-4 text-[#1A1A2E] font-mono">{l.totalDays} วัน</td>
                      <td className="py-2.5 px-4 text-[#6B7280] max-w-[150px] truncate">{l.reason}</td>
                      <td className="py-2.5 px-4"><span className={`text-xs px-2 py-0.5 rounded ${STATUS_CLASS[l.status] ?? ""}`}>{l.status === "pending" ? "รอ" : l.status === "approved" ? "อนุมัติ" : "ปฏิเสธ"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </RequireRole>
  );
}
