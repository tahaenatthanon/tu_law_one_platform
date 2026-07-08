"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import RequireRole from "@/components/shared/require-role";

type Budget = { id: string; fiscalYear: number; departmentId: number; budgetType: string; totalAmount: number; usedAmount: number; remainingAmount: number; status: string };
type BudgetReq = { id: string; title: string; amount: number; reason?: string; status: string; createdAt: string };

export default function BudgetPage() {
  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as any)?.roles ?? [];
  const canRequest = userRoles.some((r: string) => ["super_admin","system_admin","dean","dept_admin"].includes(r));
  const [tab, setTab] = useState<"view" | "request">("view");
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Request form
  const [budgetId, setBudgetId] = useState("");
  const [reqTitle, setReqTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/budget");
      const json = await res.json();
      if (json.success) setBudgets(json.data);
    } catch { setBudgets([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  const handleRequest = async () => {
    if (!budgetId || !reqTitle || !amount) { setMessage("กรุณากรอกข้อมูลให้ครบถ้วน"); return; }
    setSubmitLoading(true); setMessage("");
    try {
      const res = await fetch("/api/budget", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budgetId, title: reqTitle, amount: parseFloat(amount), reason }),
      });
      const json = await res.json();
      setMessage(json.success ? "ส่งคำของบประมาณสำเร็จ" : json.error?.message ?? "เกิดข้อผิดพลาด");
      if (json.success) { setReqTitle(""); setAmount(""); setReason(""); fetchBudgets(); }
    } catch { setMessage("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์"); }
    setSubmitLoading(false);
  };

  const formatMoney = (n: number | undefined | null) => n != null ? `฿${n.toLocaleString("th-TH", { minimumFractionDigits: 2 })}` : "฿0.00";

  return (
    <RequireRole roles={["super_admin","system_admin","dean","dept_admin","user","viewer"]}>
    <div className="pt-0 px-6 pb-8">
      <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">ระบบงบประมาณ</h1>
      <p className="text-sm text-[#6B7280] mb-6">ดูงบประมาณและขออนุมัติงบ</p>

      <div className="flex gap-2 mb-4">
        {(["view", "request"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${tab === t ? "bg-[#8B1515] text-white" : "bg-white text-[#6B7280] border border-[#D1D5DB] hover:border-[#FDB813]"}`}>
            {t === "view" ? "📊 ดูงบประมาณ" : "📝 ขออนุมัติงบ"}
          </button>
        ))}
      </div>

      {message && <div className={`p-3 mb-4 text-sm ${message.includes("สำเร็จ") ? "bg-green-50 border border-green-300 text-green-700" : "bg-[#FCE4E8] border border-[#A31D1D] text-[#A31D1D]"}`}>{message}</div>}

      {tab === "view" ? (
        loading ? <p className="text-[#9CA3AF]">กำลังโหลด...</p> : budgets.length === 0 ? (
          <div className="text-center py-16 text-[#9CA3AF]"><p className="text-sm">ไม่มีข้อมูลงบประมาณ</p></div>
        ) : (
          <div className="space-y-3">
            {budgets.map(b => {
              const pct = b.totalAmount > 0 ? (b.usedAmount / b.totalAmount * 100) : 0;
              return (
                <div key={b.id} className="bg-white border border-[#D1D5DB] p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-[#1A1A2E]">ปีงบประมาณ {b.fiscalYear + 543}</h3>
                      <p className="text-xs text-[#9CA3AF]">แผนก {b.departmentId} | {b.budgetType}</p>
                    </div>
                    <span className="text-xl font-bold text-[#A31D1D]">{formatMoney(b.totalAmount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 h-3">
                    <div className={`h-3 ${pct > 90 ? "bg-red-500" : pct > 70 ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-green-600">ใช้ไป {formatMoney(b.usedAmount)} ({pct.toFixed(1)}%)</span>
                    <span className="text-[#6B7280]">คงเหลือ {formatMoney(b.remainingAmount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="max-w-lg bg-white border border-[#D1D5DB] p-6">
          <h3 className="font-semibold text-[#1A1A2E] mb-4">ขออนุมัติงบประมาณ</h3>
          <div className="mb-3"><label className="block text-xs font-medium text-[#1A1A2E] mb-1">รหัสงบประมาณ</label><input type="text" value={budgetId} onChange={e => setBudgetId(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813]" /></div>
          <div className="mb-3"><label className="block text-xs font-medium text-[#1A1A2E] mb-1">ชื่อโครงการ/รายการ</label><input type="text" value={reqTitle} onChange={e => setReqTitle(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813]" /></div>
          <div className="mb-3"><label className="block text-xs font-medium text-[#1A1A2E] mb-1">จำนวนเงิน</label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813]" /></div>
          <div className="mb-4"><label className="block text-xs font-medium text-[#1A1A2E] mb-1">เหตุผล</label><textarea value={reason} onChange={e => setReason(e.target.value)} rows={2} className="w-full px-3 py-2 text-sm border border-[#D1D5DB]" /></div>
          <button onClick={handleRequest} disabled={submitLoading}
            className="w-full px-4 py-2.5 text-sm font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800] disabled:opacity-50">{submitLoading ? "กำลังส่ง..." : "ส่งคำขอ"}</button>
        </div>
      )}
    </div>
    </RequireRole>
  );
}
