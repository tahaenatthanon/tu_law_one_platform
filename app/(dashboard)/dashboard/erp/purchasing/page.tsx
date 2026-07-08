"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import RequireRole from "@/components/shared/require-role";

type PR = { id: string; prNo: string; status: string; totalAmount?: number; createdAt: string; items: { id: string; itemName: string; quantity: number; unitPrice: number }[] };
type PO = { id: string; poNo: string; status: string; vendor: { id: string; companyName: string }; items: { id: string; itemName: string; quantity: number; unitPrice: number }[]; createdAt: string };

export default function PurchasingPage() {
  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as any)?.roles ?? [];
  const canCreate = userRoles.some((r: string) => ["super_admin","system_admin","dean","dept_admin"].includes(r));
  const [tab, setTab] = useState<"pr" | "po">("pr");
  const [prs, setPrs] = useState<PR[]>([]);
  const [pos, setPos] = useState<PO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  // PR form
  const [items, setItems] = useState([{ itemName: "", quantity: 1, unitPrice: 0 }]);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/purchasing?type=${tab}`);
      const json = await res.json();
      if (json.success) { if (tab === "pr") setPrs(json.data); else setPos(json.data); }
    } catch { }
    setLoading(false);
  }, [tab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmitPR = async () => {
    if (items.some(i => !i.itemName || i.unitPrice <= 0)) { setMessage("กรุณากรอกรายการให้ครบถ้วน"); return; }
    setSubmitLoading(true); setMessage("");
    try {
      const res = await fetch("/api/purchasing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items }) });
      const json = await res.json();
      if (json.success) { setMessage("สร้างใบขอซื้อสำเร็จ"); setShowForm(false); setItems([{ itemName: "", quantity: 1, unitPrice: 0 }]); fetchData(); }
      else setMessage(json.error?.message ?? "เกิดข้อผิดพลาด");
    } catch { setMessage("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์"); }
    setSubmitLoading(false);
  };

  const formatMoney = (n: number | undefined | null) => n != null ? `฿${n.toLocaleString("th-TH", { minimumFractionDigits: 2 })}` : "฿0.00";
  const statusLabel = (s: string) => ({ draft: "ฉบับร่าง", submitted: "ส่งแล้ว", approved: "อนุมัติ", ordered: "สั่งซื้อแล้ว", received: "รับแล้ว" }[s] ?? s);

  const renderContent = () => {
    if (loading) return <p className="text-[#9CA3AF]">กำลังโหลด...</p>;
    if (tab === "pr") {
      if (prs.length === 0) return <div className="text-center py-16 text-[#9CA3AF]"><p className="text-sm">ไม่มีใบขอซื้อ</p></div>;
      return (
        <div className="space-y-2">{prs.map(p => (
          <div key={p.id} className="bg-white border border-[#D1D5DB] p-4">
            <div className="flex items-start justify-between"><div><span className="text-xs px-1.5 py-0.5 bg-gray-100 font-mono">{p.prNo}</span><span className="ml-2 text-xs text-[#9CA3AF]">{statusLabel(p.status)}</span></div><span className="font-bold text-[#A31D1D]">{formatMoney(p.totalAmount ?? 0)}</span></div>
            <div className="mt-2 space-y-1">{p.items.map(i => <div key={i.id} className="flex justify-between text-xs text-[#6B7280]"><span>{i.itemName} × {i.quantity}</span><span>{formatMoney(i.unitPrice * i.quantity)}</span></div>)}</div>
          </div>
        ))}</div>
      );
    }
    if (pos.length === 0) return <div className="text-center py-16 text-[#9CA3AF]"><p className="text-sm">ไม่มีใบสั่งซื้อ</p></div>;
    return (
      <div className="space-y-2">{pos.map(p => (
        <div key={p.id} className="bg-white border border-[#D1D5DB] p-4">
          <div className="flex items-start justify-between"><div><span className="text-xs px-1.5 py-0.5 bg-gray-100 font-mono">{p.poNo}</span><span className="ml-2 text-xs text-[#9CA3AF]">{p.vendor?.companyName}</span></div><span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700">{statusLabel(p.status)}</span></div>
          <div className="mt-2 space-y-1">{p.items.map(i => <div key={i.id} className="flex justify-between text-xs text-[#6B7280]"><span>{i.itemName} × {i.quantity}</span><span>{formatMoney(i.unitPrice * i.quantity)}</span></div>)}</div>
        </div>
      ))}</div>
    );
  };

  return (
    <div className="pt-0 px-6 pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">ระบบจัดซื้อจัดจ้าง (E-Purchasing)</h1>
          <p className="text-sm text-[#6B7280]">สร้างใบขอซื้อและติดตาม PO</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2.5 text-sm font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800]">+ สร้างใบขอซื้อ</button>
      </div>

      <div className="flex gap-2 mb-4">
        {(["pr", "po"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${tab === t ? "bg-[#8B1515] text-white" : "bg-white text-[#6B7280] border border-[#D1D5DB] hover:border-[#FDB813]"}`}>
            {t === "pr" ? "📋 ใบขอซื้อ (PR)" : "📦 ใบสั่งซื้อ (PO)"}
          </button>
        ))}
      </div>

      {message && <div className={`p-3 mb-4 text-sm ${message.includes("สำเร็จ") ? "bg-green-50 border border-green-300 text-green-700" : "bg-[#FCE4E8] border border-[#A31D1D] text-[#A31D1D]"}`}>{message}</div>}

      {renderContent()}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowForm(false)}>
          <div className="bg-white border border-[#FDB813] p-6 w-full max-w-lg mx-4 shadow-xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">สร้างใบขอซื้อ (PR)</h3>
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 mb-2 items-end">
                <div className="col-span-5"><label className="text-[10px] text-[#6B7280]">รายการ</label><input value={item.itemName} onChange={e => { const n = [...items]; n[idx] = { ...n[idx], itemName: e.target.value }; setItems(n); }} className="w-full px-2 py-1.5 text-sm border border-[#D1D5DB]" /></div>
                <div className="col-span-2"><label className="text-[10px] text-[#6B7280]">จำนวน</label><input type="number" value={item.quantity} onChange={e => { const n = [...items]; n[idx] = { ...n[idx], quantity: parseInt(e.target.value) || 1 }; setItems(n); }} className="w-full px-2 py-1.5 text-sm border border-[#D1D5DB]" /></div>
                <div className="col-span-3"><label className="text-[10px] text-[#6B7280]">ราคา/หน่วย</label><input type="number" value={item.unitPrice} onChange={e => { const n = [...items]; n[idx] = { ...n[idx], unitPrice: parseFloat(e.target.value) || 0 }; setItems(n); }} className="w-full px-2 py-1.5 text-sm border border-[#D1D5DB]" /></div>
                <div className="col-span-2 text-right text-xs font-bold text-[#6B7280]">{formatMoney(item.quantity * item.unitPrice)}</div>
              </div>
            ))}
            <button onClick={() => setItems([...items, { itemName: "", quantity: 1, unitPrice: 0 }])}
              className="text-sm text-[#A31D1D] hover:underline mb-4">+ เพิ่มรายการ</button>
            <div className="flex gap-2"><button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 text-sm font-medium border border-[#D1D5DB] text-[#6B7280] hover:bg-gray-100">ยกเลิก</button>
              <button onClick={handleSubmitPR} disabled={submitLoading}
                className="flex-1 px-4 py-2.5 text-sm font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800] disabled:opacity-50">{submitLoading ? "กำลังบันทึก..." : "สร้างใบขอซื้อ"}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
