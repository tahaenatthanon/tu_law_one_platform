"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import RequireRole from "@/components/shared/require-role";
import { Calculator } from "lucide-react";

type Payslip = { id: string; payPeriod: string; netSalary: number; createdAt: string };

export default function SalaryPage() {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/salary").then(r => r.json()).then(j => { if (j.success) setPayslips(j.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const formatMoney = (n: number | undefined | null) => n != null ? `฿${n.toLocaleString("th-TH", { minimumFractionDigits: 2 })}` : "฿0.00";

  return (
    <div className="pt-0 px-6 pb-8">
      <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">ระบบเงินเดือน</h1>
      <p className="text-sm text-[#6B7280] mb-6">สลิปเงินเดือนและประวัติการจ่าย</p>

      {loading ? <p className="text-[#9CA3AF]">กำลังโหลด...</p> : payslips.length === 0 ? (
        <div className="text-center py-16 text-[#9CA3AF]">
          <Calculator className="w-12 h-12 mx-auto mb-3 text-[#9CA3AF]" strokeWidth={1.5} />
          <p className="text-sm">ไม่มีข้อมูลสลิปเงินเดือน</p>
          <p className="text-xs mt-1">กรุณาติดต่อฝ่ายบุคคลเพื่ออัปโหลดข้อมูล</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50"><th className="px-4 py-3 text-left text-[#6B7280] font-medium">งวดการจ่าย</th><th className="px-4 py-3 text-right text-[#6B7280] font-medium">เงินสุทธิ</th><th className="px-4 py-3 text-left text-[#6B7280] font-medium">วันที่</th></tr></thead>
            <tbody>
              {payslips.map(p => (
                <tr key={p.id} className="border-t border-[#D1D5DB] hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-[#1A1A2E]">{p.payPeriod}</td>
                  <td className="px-4 py-3 text-right font-bold text-[#A31D1D]">{formatMoney(p.netSalary)}</td>
                  <td className="px-4 py-3 text-[#9CA3AF]">{new Date(p.createdAt).toLocaleDateString("th-TH")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
