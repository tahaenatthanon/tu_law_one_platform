"use client";

import { useState, useEffect, useCallback } from "react";

type Ticket = { id: string; title: string; description?: string; priority: string; category?: string; status: string; createdAt: string; histories: { id: string; oldStatus?: string; newStatus: string; createdAt: string }[] };

export default function HelpdeskPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try { const res = await fetch("/api/helpdesk"); const json = await res.json(); if (json.success) setTickets(json.data); } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleSubmit = async () => {
    if (!title) { setMessage("กรุณากรอกหัวข้อปัญหา"); return; }
    setSubmitLoading(true); setMessage("");
    try {
      const res = await fetch("/api/helpdesk", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, priority, category }),
      });
      const json = await res.json();
      if (json.success) { setMessage("แจ้งปัญหาสำเร็จ"); setShowForm(false); fetchTickets(); }
      else setMessage(json.error?.message ?? "เกิดข้อผิดพลาด");
    } catch { setMessage("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์"); }
    setSubmitLoading(false);
  };

  const statusLabel = (s: string) => ({ open: "🆕 เปิด", in_progress: "🔧 กำลังดำเนินการ", resolved: "✅ แก้ไขแล้ว", closed: "🔒 ปิด" }[s] ?? s);
  const statusColor = (s: string) => ({ open: "bg-blue-100 text-blue-700", in_progress: "bg-yellow-100 text-yellow-700", resolved: "bg-green-100 text-green-700", closed: "bg-gray-100 text-gray-600" }[s] ?? "bg-gray-100");
  const priorityLabel = (p: string) => ({ low: "ต่ำ", medium: "ปานกลาง", high: "สูง", critical: "วิกฤต" }[p] ?? p);
  const priorityColor = (p: string) => ({ low: "text-gray-500", medium: "text-blue-500", high: "text-orange-500", critical: "text-red-500" }[p] ?? "text-gray-500");

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">IT Helpdesk</h1>
          <p className="text-sm text-[#6B7280] mt-1">แจ้งปัญหาด้าน IT และติดตามสถานะการแก้ไข</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2.5 text-sm font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800]">+ แจ้งปัญหา</button>
      </div>

      {message && <div className={`p-3 mb-4 text-sm ${message.includes("สำเร็จ") ? "bg-green-50 border border-green-300 text-green-700" : "bg-[#FCE4E8] border border-[#A31D1D] text-[#A31D1D]"}`}>{message}</div>}

      {loading ? <p className="text-[#9CA3AF]">กำลังโหลด...</p> : tickets.length === 0 ? (
        <div className="text-center py-16 text-[#9CA3AF]">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          <p className="text-sm">ไม่มีใบแจ้งปัญหา</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map(t => (
            <div key={t.id} onClick={() => setSelectedTicket(t)}
              className="bg-white border border-[#D1D5DB] p-4 hover:border-[#FDB813] cursor-pointer transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-1.5 py-0.5 font-medium ${priorityColor(t.priority)}`}>⚡ {priorityLabel(t.priority)}</span>
                    <span className={`text-xs px-1.5 py-0.5 ${statusColor(t.status)}`}>{statusLabel(t.status)}</span>
                    {t.category && <span className="text-xs text-[#9CA3AF]">{t.category}</span>}
                  </div>
                  <h3 className="font-medium text-[#1A1A2E] mt-1">{t.title}</h3>
                  {t.description && <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-1">{t.description}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setSelectedTicket(null)}>
          <div className="bg-white border border-[#FDB813] p-6 w-full max-w-lg mx-4 shadow-xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-[#1A1A2E]">{selectedTicket.title}</h3><button onClick={() => setSelectedTicket(null)} className="text-[#9CA3AF] hover:text-[#1A1A2E]"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div>
            <div className="flex gap-2 mb-3">
              <span className={`text-xs px-2 py-1 ${statusColor(selectedTicket.status)}`}>{statusLabel(selectedTicket.status)}</span>
              <span className={`text-xs px-2 py-1 ${priorityColor(selectedTicket.priority)}`}>⚡ {priorityLabel(selectedTicket.priority)}</span>
            </div>
            {selectedTicket.description && <p className="text-sm text-[#6B7280] mb-4">{selectedTicket.description}</p>}
            {selectedTicket.histories.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-[#1A1A2E] mb-2">ประวัติการดำเนินการ</h4>
                <div className="space-y-1">
                  {selectedTicket.histories.map(h => (
                    <div key={h.id} className="text-xs text-[#6B7280] p-1.5 bg-gray-50">
                      {h.oldStatus ? `${h.oldStatus} → ${h.newStatus}` : `สร้างเป็น ${h.newStatus}`} — {new Date(h.createdAt).toLocaleString("th-TH")}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowForm(false)}>
          <div className="bg-white border border-[#FDB813] p-6 w-full max-w-md mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">แจ้งปัญหา IT</h3>
            <div className="mb-3"><label className="block text-xs font-medium text-[#1A1A2E] mb-1">หัวข้อปัญหา *</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813]" /></div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">ความสำคัญ</label><select value={priority} onChange={e => setPriority(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB]"><option value="low">ต่ำ</option><option value="medium">ปานกลาง</option><option value="high">สูง</option><option value="critical">วิกฤต</option></select></div>
              <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">หมวดหมู่</label><input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="ฮาร์ดแวร์, ซอฟต์แวร์..." className="w-full px-3 py-2 text-sm border border-[#D1D5DB]" /></div>
            </div>
            <div className="mb-4"><label className="block text-xs font-medium text-[#1A1A2E] mb-1">รายละเอียด</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 text-sm border border-[#D1D5DB]" /></div>
            <div className="flex gap-2"><button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 text-sm font-medium border border-[#D1D5DB] text-[#6B7280] hover:bg-gray-100">ยกเลิก</button>
              <button onClick={handleSubmit} disabled={submitLoading}
                className="flex-1 px-4 py-2.5 text-sm font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800] disabled:opacity-50">{submitLoading ? "กำลังส่ง..." : "แจ้งปัญหา"}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
