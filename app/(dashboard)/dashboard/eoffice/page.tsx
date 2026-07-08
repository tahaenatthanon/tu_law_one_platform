"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import RequireRole from "@/components/shared/require-role";
import { X } from "lucide-react";

type EofficeDoc = {
  id: string; docNo: string; title: string; secretLevel: string; urgentLevel: string;
  status: string; createdAt: string;
  senderDepartment: { id: number; name: string };
  routings: { id: string; sender: { firstNameTh: string; lastNameTh: string }; receiver: { firstNameTh: string; lastNameTh: string }; actionType: string; remark?: string; isRead: boolean; createdAt: string }[];
};

export default function EofficePage() {
  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as any)?.roles ?? [];
  const canCompose = userRoles.some((r: string) => ["super_admin","system_admin","dean","dept_admin","user"].includes(r));

  const [tab, setTab] = useState<"inbox" | "sent" | "compose">("inbox");
  const [docs, setDocs] = useState<EofficeDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<EofficeDoc | null>(null);

  // Compose
  const [title, setTitle] = useState("");
  const [secretLevel, setSecretLevel] = useState("normal");
  const [urgentLevel, setUrgentLevel] = useState("normal");
  const [deptId, setDeptId] = useState("1");
  const [receiverId, setReceiverId] = useState("");
  const [remark, setRemark] = useState("");
  const [sendLoading, setSendLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/eoffice?type=${tab === "inbox" ? "inbox" : "sent"}`);
      const json = await res.json();
      if (json.success) setDocs(json.data);
    } catch { setDocs([]); }
    setLoading(false);
  }, [tab]);

  useEffect(() => { if (tab !== "compose") fetchDocs(); }, [tab, fetchDocs]);

  const handleSend = async () => {
    if (!title || !receiverId) { setMessage("กรุณากรอกข้อมูลให้ครบถ้วน"); return; }
    setSendLoading(true); setMessage("");
    try {
      const res = await fetch("/api/eoffice", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, secretLevel, urgentLevel, senderDepartmentId: parseInt(deptId), receiverUserId: receiverId, remark }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage("ส่งหนังสือสำเร็จ"); setTitle(""); setReceiverId(""); setRemark("");
        setTab("sent");
      } else setMessage(json.error?.message ?? "เกิดข้อผิดพลาด");
    } catch { setMessage("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์"); }
    setSendLoading(false);
  };

  const statusLabel = (s: string) => ({ draft: "ฉบับร่าง", sent: "ส่งแล้ว", received: "รับแล้ว", read: "อ่านแล้ว", archived: "จัดเก็บ" }[s] ?? s);

  return (
    <div className="pt-0 px-6 pb-8">
      <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">ระบบ E-Office</h1>
      <p className="text-sm text-[#6B7280] mb-6">ระบบสารบรรณอิเล็กทรอนิกส์ — รับ-ส่งหนังสือ ติดตามสถานะ</p>

      <div className="flex gap-2 mb-4">
        {(["inbox", "sent", "compose"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${tab === t ? "bg-[#8B1515] text-white" : "bg-white text-[#6B7280] border border-[#D1D5DB] hover:border-[#FDB813]"}`}>
            {t === "inbox" ? "📥 กล่องหนังสือเข้า" : t === "sent" ? "📤 ส่งหนังสือออก" : "✏️ เขียนหนังสือ"}
          </button>
        ))}
      </div>

      {tab === "compose" ? (
        <div className="bg-white border border-[#D1D5DB] p-6 max-w-2xl">
          {message && <div className={`p-3 mb-4 text-sm ${message.includes("สำเร็จ") ? "bg-green-50 border border-green-300 text-green-700" : "bg-[#FCE4E8] border border-[#A31D1D] text-[#A31D1D]"}`}>{message}</div>}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">ชั้นความลับ</label><select value={secretLevel} onChange={e => setSecretLevel(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB]"><option value="normal">ปกติ</option><option value="confidential">ลับ</option><option value="secret">ลับมาก</option></select></div>
            <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">ชั้นความเร็ว</label><select value={urgentLevel} onChange={e => setUrgentLevel(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB]"><option value="normal">ปกติ</option><option value="urgent">ด่วน</option><option value="very_urgent">ด่วนมาก</option></select></div>
          </div>
          <div className="mb-3"><label className="block text-xs font-medium text-[#1A1A2E] mb-1">เรื่อง</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813]" /></div>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">รหัสแผนกผู้ส่ง</label><input type="number" value={deptId} onChange={e => setDeptId(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB]" /></div>
            <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">รหัสผู้รับ</label><input type="text" value={receiverId} onChange={e => setReceiverId(e.target.value)} placeholder="UUID ของผู้รับ" className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813]" /></div>
          </div>
          <div className="mb-4"><label className="block text-xs font-medium text-[#1A1A2E] mb-1">หมายเหตุ</label><textarea value={remark} onChange={e => setRemark(e.target.value)} rows={2} className="w-full px-3 py-2 text-sm border border-[#D1D5DB]" /></div>
          <button onClick={handleSend} disabled={sendLoading}
            className="px-6 py-2.5 text-sm font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800] disabled:opacity-50 transition-all">
            {sendLoading ? "กำลังส่ง..." : "ส่งหนังสือ"}
          </button>
        </div>
      ) : (
        <div>
          {loading ? <p className="text-[#9CA3AF]">กำลังโหลด...</p> : docs.length === 0 ? (
            <div className="text-center py-16 text-[#9CA3AF]"><p className="text-sm">ไม่มีรายการหนังสือ</p></div>
          ) : (
            <div className="space-y-2">
              {docs.map(d => (
                <div key={d.id} onClick={() => setSelectedDoc(d)}
                  className="bg-white border border-[#D1D5DB] p-4 hover:border-[#FDB813] cursor-pointer transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-[#6B7280] font-mono">{d.docNo}</span>
                        {d.urgentLevel === "urgent" && <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 font-bold">ด่วน</span>}
                      </div>
                      <h3 className="font-medium text-[#1A1A2E] mt-1">{d.title}</h3>
                      <p className="text-xs text-[#9CA3AF] mt-1">{d.senderDepartment?.name} • {statusLabel(d.status)} • {d.routings.length} การส่งต่อ</p>
                    </div>
                    {d.routings.some(r => !r.isRead) && tab === "inbox" && <span className="w-2 h-2 bg-red-500 rounded-full shrink-0" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setSelectedDoc(null)}>
          <div className="bg-white border border-[#FDB813] p-6 w-full max-w-2xl mx-4 shadow-xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-[#1A1A2E]">{selectedDoc.title}</h3><button onClick={() => setSelectedDoc(null)} className="text-[#9CA3AF] hover:text-[#1A1A2E]"><X className="w-5 h-5" strokeWidth={2} /></button></div>
            <div className="grid grid-cols-2 gap-2 mb-4 text-sm"><div><span className="text-[#6B7280]">เลขที่:</span> {selectedDoc.docNo}</div><div><span className="text-[#6B7280]">สถานะ:</span> {statusLabel(selectedDoc.status)}</div><div><span className="text-[#6B7280]">ชั้นความลับ:</span> {selectedDoc.secretLevel}</div><div><span className="text-[#6B7280]">หน่วยงาน:</span> {selectedDoc.senderDepartment?.name}</div></div>
            <h4 className="text-sm font-semibold text-[#1A1A2E] mb-2">ประวัติการส่งต่อ</h4>
            <div className="space-y-2">
              {selectedDoc.routings.map(r => (
                <div key={r.id} className="flex items-center gap-3 p-2 border-l-2 border-[#FDB813] bg-gray-50 text-sm">
                  <span className="text-[#6B7280]">{r.sender?.firstNameTh} → {r.receiver?.firstNameTh}</span>
                  <span className="text-[10px] text-[#9CA3AF]">{r.actionType}</span>
                  {r.remark && <span className="text-xs text-[#6B7280]">({r.remark})</span>}
                  {r.isRead && <span className="text-[10px] text-green-600">✓ อ่านแล้ว</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
