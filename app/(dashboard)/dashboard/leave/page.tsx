"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import RequireRole from "@/components/shared/require-role";

type Leave = { id: string; leaveType: string; reason?: string; startDate: string; endDate: string; status: string; approverUserId?: string; createdAt: string };

export default function LeavePage() {
  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as any)?.roles ?? [];
  const canCreate = userRoles.some((r: string) => ["super_admin","system_admin","dean","dept_admin","user"].includes(r));
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [leaveType, setLeaveType] = useState("ลาป่วย");
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const url = statusFilter ? `/api/leave?status=${statusFilter}` : "/api/leave";
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) setLeaves(json.data);
    } catch { setLeaves([]); }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  const handleSubmit = async () => {
    if (!startDate || !endDate) { setMessage("กรุณากรอกวันที่"); return; }
    setSubmitLoading(true); setMessage("");
    try {
      const res = await fetch("/api/leave", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaveType, reason, startDate, endDate }),
      });
      const json = await res.json();
      if (json.success) { setMessage("ยื่นคำขอลาสำเร็จ"); setShowForm(false); fetchLeaves(); }
      else setMessage(json.error?.message ?? "เกิดข้อผิดพลาด");
    } catch { setMessage("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์"); }
    setSubmitLoading(false);
  };

  const leaveTypes = ["ลาป่วย", "ลากิจ", "ลาพักผ่อน", "ลาคลอด", "ลาบวช", "ลาอุปสมบท", "ลาไปศึกษาต่อ", "อื่นๆ"];
  const statusLabel = (s: string) => ({ pending: "⏳ รออนุมัติ", approved: "✅ อนุมัติแล้ว", rejected: "❌ ไม่อนุมัติ", cancelled: "↩️ ยกเลิก" }[s] ?? s);
  const statusColor = (s: string) => ({ pending: "text-yellow-600 bg-yellow-50", approved: "text-green-600 bg-green-50", rejected: "text-red-500 bg-red-50", cancelled: "text-gray-500 bg-gray-50" }[s] ?? "text-gray-500");

  return (
    <div className="pt-0 px-6 pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">ระบบลาออนไลน์</h1>
          <p className="text-sm text-[#6B7280]">ยื่นคำขอลา ตรวจสอบสถานะ และประวัติการลา</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2.5 text-sm font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800] transition-colors">+ ยื่นคำขอลา</button>
      </div>

      {message && <div className={`p-3 mb-4 text-sm ${message.includes("สำเร็จ") ? "bg-green-50 border border-green-300 text-green-700" : "bg-[#FCE4E8] border border-[#A31D1D] text-[#A31D1D]"}`}>{message}</div>}

      <div className="flex gap-2 mb-4">
        {["", "pending", "approved", "rejected"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium border transition-colors ${statusFilter === s ? "bg-[#8B1515] text-white border-[#8B1515]" : "bg-white text-[#6B7280] border-[#D1D5DB] hover:border-[#FDB813]"}`}>
            {s === "" ? "ทั้งหมด" : statusLabel(s).replace(/[^\u0E00-\u0E7Fa-zA-Z]/g, "")}
          </button>
        ))}
      </div>

      {loading ? <p className="text-[#9CA3AF]">กำลังโหลด...</p> : leaves.length === 0 ? (
        <div className="text-center py-16 text-[#9CA3AF]"><p className="text-sm">ไม่มีประวัติการลา</p></div>
      ) : (
        <div className="space-y-2">
          {leaves.map(l => (
            <div key={l.id} className="bg-white border border-[#D1D5DB] p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 font-medium">{l.leaveType}</span>
                    <span className={`text-xs px-1.5 py-0.5 font-medium ${statusColor(l.status)}`}>{statusLabel(l.status)}</span>
                  </div>
                  <p className="text-sm text-[#6B7280] mt-1">
                    {new Date(l.startDate).toLocaleDateString("th-TH")} — {new Date(l.endDate).toLocaleDateString("th-TH")}
                    ({Math.ceil((new Date(l.endDate).getTime() - new Date(l.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} วัน)
                  </p>
                  {l.reason && <p className="text-xs text-[#9CA3AF] mt-1">เหตุผล: {l.reason}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowForm(false)}>
          <div className="bg-white border border-[#FDB813] p-6 w-full max-w-md mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">ยื่นคำขอลา</h3>
            <div className="mb-3"><label className="block text-xs font-medium text-[#1A1A2E] mb-1">ประเภทการลา</label><select value={leaveType} onChange={e => setLeaveType(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB]">{leaveTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">วันที่เริ่ม</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB]" /></div>
              <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">วันที่สิ้นสุด</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB]" /></div>
            </div>
            <div className="mb-4"><label className="block text-xs font-medium text-[#1A1A2E] mb-1">เหตุผล</label><textarea value={reason} onChange={e => setReason(e.target.value)} rows={2} className="w-full px-3 py-2 text-sm border border-[#D1D5DB]" /></div>
            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 text-sm font-medium border border-[#D1D5DB] text-[#6B7280] hover:bg-gray-100">ยกเลิก</button>
              <button onClick={handleSubmit} disabled={submitLoading}
                className="flex-1 px-4 py-2.5 text-sm font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800] disabled:opacity-50">{submitLoading ? "กำลังส่ง..." : "ยื่นคำขอ"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
