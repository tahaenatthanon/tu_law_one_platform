"use client";

import { useState, useEffect } from "react";
import RequireRole from "@/components/shared/require-role";
import { useSession } from "next-auth/react";

/* ─── Types ─── */
type JournalEntry = { id: string; entryNo: string; entryDate: string; description: string; entryType: string; totalDebit: number; totalCredit: number; status: string };
type ChartAccount = { id: string; accountCode: string; accountName: string; accountType: string };
type Invoice = { id: string; invoiceNo: string; vendorName: string; invoiceDate: string; dueDate: string; totalAmount: number; vatAmount: number; status: string; paidAmount: number };
type Receipt = { id: string; receiptNo: string; payerName: string; receiptDate: string; totalAmount: number; paymentMethod: string; status: string };
type Payment = { id: string; paymentNo: string; amount: number; paymentDate: string; paymentMethod: string; referenceNo: string; status: string };

/* ─── Mock Data ─── */
const data_ENTRIES: JournalEntry[] = [
  { id: "je-1", entryNo: "JV-2569-001", entryDate: "2569-07-01", description: "บันทึกค่าใช้จ่ายดำเนินงาน", entryType: "journal", totalDebit: 50000, totalCredit: 50000, status: "posted" },
  { id: "je-2", entryNo: "JV-2569-002", entryDate: "2569-06-15", description: "โอนงบประมาณระหว่างหน่วยงาน", entryType: "journal", totalDebit: 100000, totalCredit: 100000, status: "posted" },
  { id: "je-3", entryNo: "JV-2569-003", entryDate: "2569-05-20", description: "ปรับปรุงบัญชีสิ้นเดือน", entryType: "adjustment", totalDebit: 25000, totalCredit: 25000, status: "draft" },
];

const data_INVOICES: Invoice[] = [
  { id: "inv-1", invoiceNo: "INV-2569-001", vendorName: "บจก. เทคโนโลยีสารสนเทศ", invoiceDate: "2569-06-01", dueDate: "2569-07-01", totalAmount: 85000, vatAmount: 5950, status: "pending", paidAmount: 0 },
  { id: "inv-2", invoiceNo: "INV-2569-002", vendorName: "บจก. อุปกรณ์สำนักงาน", invoiceDate: "2569-05-15", dueDate: "2569-06-15", totalAmount: 45000, vatAmount: 3150, status: "paid", paidAmount: 45000 },
  { id: "inv-3", invoiceNo: "INV-2569-003", vendorName: "หจก. ศึกษาภัณฑ์", invoiceDate: "2569-06-20", dueDate: "2569-07-20", totalAmount: 32000, vatAmount: 2240, status: "pending", paidAmount: 0 },
];

const data_RECEIPTS: Receipt[] = [
  { id: "rec-1", receiptNo: "REC-2569-001", payerName: "นักศึกษา", receiptDate: "2569-06-10", totalAmount: 12000, paymentMethod: "โอนเงิน", status: "completed" },
  { id: "rec-2", receiptNo: "REC-2569-002", payerName: "กองทุนวิจัย", receiptDate: "2569-05-20", totalAmount: 200000, paymentMethod: "เช็ค", status: "completed" },
];

const FMT = (n: number) => n.toLocaleString("th-TH");
const data_PAYMENTS: Payment[] = [
  { id: "pay-1", paymentNo: "PMT-2569-001", amount: 45000, paymentDate: "2569-06-01", paymentMethod: "โอนเงิน", referenceNo: "INV-2569-002", status: "completed" },
  { id: "pay-2", paymentNo: "PMT-2569-002", amount: 25000, paymentDate: "2569-06-15", paymentMethod: "เช็ค", referenceNo: "บก.003", status: "pending" },
];

export default function ErpFinancePage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as Record<string, unknown>)?.roles as string[] ?? [];

  const tabs = [
    { key: "journal" as const, label: "📒 สมุดรายวัน" },
    { key: "coa" as const, label: "📋 ผังบัญชี" },
    { key: "invoice" as const, label: "🧾 ใบแจ้งหนี้" },
    { key: "receipt" as const, label: "📄 ใบเสร็จรับเงิน" },
    { key: "payment" as const, label: "💳 การจ่ายเงิน" },
  ];
  const [tab, setTab] = useState<typeof tabs[number]["key"]>("journal");

  useEffect(() => {
    fetch("/api/erp/finance")
      .then(function(r) { return r.json(); })
      .then(function(json) { if (json.success) setData(json.data); else setError(json.error?.message || "Error"); })
      .catch(function() { setError("ไม่สามารถโหลดข้อมูลได้"); })
      .finally(function() { setLoading(false); });
  }, []);

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-4 bg-gray-200 rounded w-1/3"/><div className="h-6 bg-gray-100 rounded"/></div></div>;
  if (error) return <div className="p-8 text-center"><div className="bg-[#FCE4E8] border border-[#A31D1D] p-4"><p className="text-sm text-[#A31D1D]">{error}</p></div></div>;

  const totalAssets = data_ENTRIES.reduce((s, e) => s + e.totalDebit, 0);
  const totalLiabilities = data_INVOICES.filter((i) => i.status === "pending").reduce((s, i) => s + i.totalAmount, 0);
  const totalReceipts = data_RECEIPTS.reduce((s, r) => s + r.totalAmount, 0);
  const totalPayments = data_PAYMENTS.reduce((s, p) => s + p.amount, 0);

  return (
    <RequireRole roles={["super_admin", "system_admin", "dean", "dept_admin", "user", "viewer"]}>
      <div className="pt-0 px-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">ระบบการเงิน</h1>
            <p className="text-sm text-[#6B7280]">บริหารจัดการบัญชีและการเงิน</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {[
            { label: "รายรับรวม", value: FMT(totalReceipts), color: "#059669" },
            { label: "รายจ่ายรวม", value: FMT(totalPayments), color: "#A31D1D" },
            { label: "เจ้าหนี้คงค้าง", value: FMT(totalLiabilities), color: "#FDB813" },
            { label: "รายการบัญชี", value: `${data_ENTRIES.length} รายการ`, color: "#1A1A2E" },
          ].map((c, i) => (
            <div key={i} className="bg-white border border-[#D1D5DB] p-4">
              <p className="text-xs text-[#6B7280] mb-1">{c.label}</p>
              <p className="text-xl font-bold" style={{ color: c.color }}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#F5F5F5] p-1 rounded mb-6 w-fit flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                tab === t.key ? "bg-[#FDB813] text-[#1A1A2E] shadow-sm" : "text-[#6B7280] hover:text-[#1A1A2E]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "journal" && (
          <div className="bg-white border border-[#D1D5DB] overflow-x-auto">
            <table className="w-full text-sm"><thead><tr className="bg-[#F5F5F5] text-left"><th className="py-2.5 px-4">เลขที่เอกสาร</th><th className="py-2.5 px-4">วันที่</th><th className="py-2.5 px-4">รายการ</th><th className="py-2.5 px-4 text-right">เดบิต</th><th className="py-2.5 px-4 text-right">เครดิต</th><th className="py-2.5 px-4">สถานะ</th></tr></thead>
              <tbody>{data_ENTRIES.map(e => (<tr key={e.id} className="border-t border-[#F5F5F5]"><td className="py-2.5 px-4 font-mono text-xs">{e.entryNo}</td><td className="py-2.5 px-4">{new Date(e.entryDate).toLocaleDateString("th-TH")}</td><td className="py-2.5 px-4">{e.description}</td><td className="py-2.5 px-4 text-right font-mono">{FMT(e.totalDebit)}</td><td className="py-2.5 px-4 text-right font-mono">{FMT(e.totalCredit)}</td><td className="py-2.5 px-4"><span className="text-[11px] px-1.5 py-0.5 bg-green-100 text-green-700">{e.status}</span></td></tr>))}</tbody></table></div>)}
        {tab === "coa" && <div className="bg-white border border-[#D1D5DB] p-6 text-center text-[#9CA3AF] text-sm">กำลังพัฒนาผังบัญชี — จะแสดง Chart of Accounts ที่นี่</div>}
        {tab === "invoice" && (
          <div className="bg-white border border-[#D1D5DB] overflow-x-auto">
            <table className="w-full text-sm"><thead><tr className="bg-[#F5F5F5] text-left"><th className="py-2.5 px-4">เลขที่</th><th className="py-2.5 px-4">ผู้ขาย</th><th className="py-2.5 px-4">วันที่</th><th className="py-2.5 px-4 text-right">จำนวนเงิน</th><th className="py-2.5 px-4 text-right">ภาษี</th><th className="py-2.5 px-4">สถานะ</th></tr></thead>
              <tbody>{data_INVOICES.map(i => (<tr key={i.id} className="border-t border-[#F5F5F5]"><td className="py-2.5 px-4 font-mono text-xs">{i.invoiceNo}</td><td className="py-2.5 px-4">{i.vendorName}</td><td className="py-2.5 px-4">{new Date(i.invoiceDate).toLocaleDateString("th-TH")}</td><td className="py-2.5 px-4 text-right font-mono">{FMT(i.totalAmount)}</td><td className="py-2.5 px-4 text-right font-mono">{FMT(i.vatAmount)}</td><td className="py-2.5 px-4"><span className={`text-[11px] px-1.5 py-0.5 ${i.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{i.status === "paid" ? "จ่ายแล้ว" : "ค้างจ่าย"}</span></td></tr>))}</tbody></table></div>)}
        {tab === "receipt" && (
          <div className="bg-white border border-[#D1D5DB] overflow-x-auto">
            <table className="w-full text-sm"><thead><tr className="bg-[#F5F5F5] text-left"><th className="py-2.5 px-4">เลขที่</th><th className="py-2.5 px-4">ผู้ชำระ</th><th className="py-2.5 px-4">วันที่</th><th className="py-2.5 px-4 text-right">จำนวนเงิน</th><th className="py-2.5 px-4">วิธีชำระ</th></tr></thead>
              <tbody>{data_RECEIPTS.map(r => (<tr key={r.id} className="border-t border-[#F5F5F5]"><td className="py-2.5 px-4 font-mono text-xs">{r.receiptNo}</td><td className="py-2.5 px-4">{r.payerName}</td><td className="py-2.5 px-4">{new Date(r.receiptDate).toLocaleDateString("th-TH")}</td><td className="py-2.5 px-4 text-right font-mono">{FMT(r.totalAmount)}</td><td className="py-2.5 px-4">{r.paymentMethod}</td></tr>))}</tbody></table></div>)}
        {tab === "payment" && (
          <div className="bg-white border border-[#D1D5DB] overflow-x-auto">
            <table className="w-full text-sm"><thead><tr className="bg-[#F5F5F5] text-left"><th className="py-2.5 px-4">เลขที่</th><th className="py-2.5 px-4">วันที่</th><th className="py-2.5 px-4 text-right">จำนวนเงิน</th><th className="py-2.5 px-4">วิธีชำระ</th><th className="py-2.5 px-4">อ้างอิง</th></tr></thead>
              <tbody>{data_PAYMENTS.map(p => (<tr key={p.id} className="border-t border-[#F5F5F5]"><td className="py-2.5 px-4 font-mono text-xs">{p.paymentNo}</td><td className="py-2.5 px-4">{new Date(p.paymentDate).toLocaleDateString("th-TH")}</td><td className="py-2.5 px-4 text-right font-mono">{FMT(p.amount)}</td><td className="py-2.5 px-4">{p.paymentMethod}</td><td className="py-2.5 px-4 text-xs font-mono">{p.referenceNo}</td></tr>))}</tbody></table></div>)}
      </div>
    </RequireRole>
  );
}
