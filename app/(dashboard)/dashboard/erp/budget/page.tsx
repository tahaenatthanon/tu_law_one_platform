"use client";

import { useState, useEffect, useMemo } from "react";
import RequireRole from "@/components/shared/require-role";
import { useSession } from "next-auth/react";

/* ─── Types ─── */
type BudgetPlan = {
  id: string; name: string; fiscalYear: number; departmentName: string; departmentId: number;
  totalBudget: number; totalExpense: number; remainingBudget: number; status: string;
};
type BudgetItem = { id: string; planId: string; name: string; category: string; allocatedAmount: number; usedAmount: number };
type BudgetExpense = { id: string; planId: string; description: string; amount: number; expenseDate: string; docRef: string; status: string };

/* ─── Mock Data ─── */
const ADMIN_ROLES = ["super_admin", "system_admin"];

const data_PLANS: BudgetPlan[] = [
  { id: "bp-1", name: "งบประมาณประจำปี 2569", fiscalYear: 2569, departmentName: "คณะนิติศาสตร์", departmentId: 1, totalBudget: 2500000, totalExpense: 1800000, remainingBudget: 700000, status: "active" },
  { id: "bp-2", name: "งบพัฒนาระบบ IT", fiscalYear: 2569, departmentName: "ฝ่าย IT", departmentId: 2, totalBudget: 800000, totalExpense: 450000, remainingBudget: 350000, status: "active" },
  { id: "bp-3", name: "งบโครงการวิจัย", fiscalYear: 2569, departmentName: "ฝ่ายวิชาการ", departmentId: 3, totalBudget: 1200000, totalExpense: 300000, remainingBudget: 900000, status: "active" },
  { id: "bp-4", name: "งบประมาณประจำปี 2568", fiscalYear: 2568, departmentName: "คณะนิติศาสตร์", departmentId: 1, totalBudget: 2300000, totalExpense: 2200000, remainingBudget: 100000, status: "closed" },
];

const data_ITEMS: BudgetItem[] = [
  { id: "bi-1", planId: "bp-1", name: "งบบุคลากร", category: "เงินเดือน", allocatedAmount: 1000000, usedAmount: 800000 },
  { id: "bi-2", planId: "bp-1", name: "งบดำเนินงาน", category: "ดำเนินงาน", allocatedAmount: 800000, usedAmount: 600000 },
  { id: "bi-3", planId: "bp-1", name: "งบลงทุน", category: "ลงทุน", allocatedAmount: 500000, usedAmount: 300000 },
  { id: "bi-4", planId: "bp-2", name: "ซื้ออุปกรณ์เครือข่าย", category: "ลงทุน", allocatedAmount: 400000, usedAmount: 350000 },
  { id: "bi-5", planId: "bp-3", name: "ทุนวิจัย", category: "ดำเนินงาน", allocatedAmount: 600000, usedAmount: 200000 },
];

const data_EXPENSES: BudgetExpense[] = [
  { id: "be-1", planId: "bp-1", description: "ค่าจ้างอาจารย์พิเศษ", amount: 50000, expenseDate: "2569-07-01", docRef: "บก.001", status: "approved" },
  { id: "be-2", planId: "bp-1", description: "ค่าเดินทางไปราชการ", amount: 15000, expenseDate: "2569-06-15", docRef: "บก.002", status: "approved" },
  { id: "be-3", planId: "bp-2", description: "ค่าเช่า cloud server", amount: 25000, expenseDate: "2569-06-01", docRef: "บก.003", status: "pending" },
];

const FMT = (n: number) => n.toLocaleString("th-TH");
const data_FISCAL_YEARS = [2569, 2568, 2567];

export default function ErpBudgetPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as Record<string, unknown>)?.roles as string[] ?? [];
  const isAdmin = userRoles.some((r) => ADMIN_ROLES.includes(r));
  const isDean = userRoles.includes("dean");

  const [tab, setTab] = useState<"plans" | "expenses" | "transfer">("plans");
  const [fyFilter, setFyFilter] = useState<number>(2569);
  const [selectedPlan, setSelectedPlan] = useState<string | null>("bp-1");

  useEffect(() => {
    fetch("/api/erp/budget")
      .then(function(r) { return r.json(); })
      .then(function(json) { if (json.success) setData(json.data); else setError(json.error?.message || "Error"); })
      .catch(function() { setError("ไม่สามารถโหลดข้อมูลได้"); })
      .finally(function() { setLoading(false); });
  }, []);

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-4 bg-gray-200 rounded w-1/3"/><div className="h-6 bg-gray-100 rounded"/></div></div>;
  if (error) return <div className="p-8 text-center"><div className="bg-[#FCE4E8] border border-[#A31D1D] p-4"><p className="text-sm text-[#A31D1D]">{error}</p></div></div>;

  const filteredPlans = data_PLANS.filter((p) => p.fiscalYear === fyFilter);
  const planItems = data_ITEMS.filter((i) => i.planId === selectedPlan);
  const planExpenses = data_EXPENSES.filter((e) => e.planId === selectedPlan);

  const selectedPlanData = data_PLANS.find((p) => p.id === selectedPlan);

  const tabs = [
    { key: "plans" as const, label: "📊 แผนงบประมาณ" },
    { key: "expenses" as const, label: "💸 รายการใช้จ่าย" },
    ...(isAdmin || isDean ? [{ key: "transfer" as const, label: "🔄 โอนงบประมาณ" }] : []),
  ];

  return (
    <RequireRole roles={["super_admin", "system_admin", "dean", "dept_admin", "user", "viewer"]}>
      <div className="pt-0 px-6 pb-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">ระบบงบประมาณ</h1>
            <p className="text-sm text-[#6B7280]">บริหารจัดการงบประมาณคณะนิติศาสตร์</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-[#6B7280]">ปีงบประมาณ:</label>
            <select
              value={fyFilter}
              onChange={(e) => setFyFilter(Number(e.target.value))}
              className="px-3 py-1.5 text-sm border border-[#D1D5DB] bg-white focus:outline-none focus:border-[#FDB813]"
            >
              {data_FISCAL_YEARS.map((y) => (
                <option key={y} value={y}>พ.ศ. {y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {[
            { label: "งบประมาณรวม", value: FMT(filteredPlans.reduce((s, p) => s + p.totalBudget, 0)), color: "#8B1515" },
            { label: "ใช้ไปแล้ว", value: FMT(filteredPlans.reduce((s, p) => s + p.totalExpense, 0)), color: "#FDB813" },
            { label: "คงเหลือ", value: FMT(filteredPlans.reduce((s, p) => s + p.remainingBudget, 0)), color: "#059669" },
            { label: "แผนงบ", value: `${filteredPlans.length} แผน`, color: "#1A1A2E" },
          ].map((c, i) => (
            <div key={i} className="bg-white border border-[#D1D5DB] p-4">
              <p className="text-xs text-[#6B7280] mb-1">{c.label}</p>
              <p className="text-xl font-bold" style={{ color: c.color }}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#F5F5F5] p-1 rounded mb-6 w-fit">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.key ? "bg-[#FDB813] text-[#1A1A2E] shadow-sm" : "text-[#6B7280] hover:text-[#1A1A2E]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ─── TAB: Plans ─── */}
        {tab === "plans" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Plan List */}
            <div className="lg:col-span-1 space-y-3">
              {filteredPlans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full text-left p-4 border transition-colors ${
                    selectedPlan === plan.id
                      ? "border-[#FDB813] bg-[#FEF9E7]"
                      : "border-[#D1D5DB] bg-white hover:border-[#FDB813]"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-[#1A1A2E] text-sm">{plan.name}</h3>
                    <span className={`text-xs px-2 py-0.5 ${plan.status === "approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {plan.status === "approved" ? "อนุมัติแล้ว" : "รออนุมัติ"}
                    </span>
                  </div>
                  <p className="text-xs text-[#9CA3AF]">{plan.departmentName} · ปี {plan.fiscalYear}</p>
                  <div className="w-full bg-gray-200 h-2 mt-3">
                    <div
                      className="h-2 bg-[#8B1515]"
                      style={{ width: `${Math.min((plan.totalExpense / plan.totalBudget) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-[#6B7280]">{FMT(plan.totalExpense)}</span>
                    <span className="text-green-600">{FMT(plan.remainingBudget)}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Plan Detail */}
            <div className="lg:col-span-2 bg-white border border-[#D1D5DB] p-6">
              {selectedPlanData ? (
                <>
                  <h3 className="font-bold text-[#1A1A2E] text-lg mb-1">{selectedPlanData.name}</h3>
                  <p className="text-xs text-[#6B7280] mb-4">
                    {selectedPlanData.departmentName} · ปีงบประมาณ {selectedPlanData.fiscalYear} · งบรวม {FMT(selectedPlanData.totalBudget)}
                  </p>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#D1D5DB] text-left">
                        <th className="py-2 font-medium text-[#6B7280] w-8">#</th>
                        <th className="py-2 font-medium text-[#6B7280]">รายการ</th>
                        <th className="py-2 font-medium text-[#6B7280]">หมวด</th>
                        <th className="py-2 font-medium text-[#6B7280] text-right">จัดสรร</th>
                        <th className="py-2 font-medium text-[#6B7280] text-right">ใช้ไป</th>
                        <th className="py-2 font-medium text-[#6B7280] text-right">คงเหลือ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {planItems.map((item, i) => (
                        <tr key={item.id} className="border-b border-[#F5F5F5] hover:bg-[#FEF9E7]">
                          <td className="py-2 text-[#9CA3AF]">{i + 1}</td>
                          <td className="py-2 text-[#1A1A2E] font-medium">{item.name}</td>
                          <td className="py-2 text-[#6B7280]">{item.category}</td>
                          <td className="py-2 text-right text-[#1A1A2E]">{FMT(item.allocatedAmount)}</td>
                          <td className="py-2 text-right text-[#A31D1D]">{FMT(item.usedAmount)}</td>
                          <td className="py-2 text-right text-green-600">{FMT(item.allocatedAmount - item.usedAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <p className="text-[#9CA3AF] text-sm text-center py-8">เลือกแผนงบประมาณเพื่อดูรายละเอียด</p>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB: Expenses ─── */}
        {tab === "expenses" && (
          <div>
            <div className="flex gap-2 mb-4">
              <select
                value={selectedPlan ?? ""}
                onChange={(e) => setSelectedPlan(e.target.value || null)}
                className="px-3 py-2 text-sm border border-[#D1D5DB] bg-white focus:outline-none focus:border-[#FDB813]"
              >
                <option value="">-- เลือกแผนงบ --</option>
                {filteredPlans.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            {selectedPlan && planExpenses.length > 0 ? (
              <div className="bg-white border border-[#D1D5DB] overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F5F5F5] text-left">
                      <th className="py-3 px-4 font-medium text-[#1A1A2E]">วันที่</th>
                      <th className="py-3 px-4 font-medium text-[#1A1A2E]">รายการ</th>
                      <th className="py-3 px-4 font-medium text-[#1A1A2E] text-right">จำนวนเงิน</th>
                      <th className="py-3 px-4 font-medium text-[#1A1A2E]">เลขเอกสาร</th>
                      <th className="py-3 px-4 font-medium text-[#1A1A2E]">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planExpenses.map((e) => (
                      <tr key={e.id} className="border-b border-[#F5F5F5] hover:bg-[#FEF9E7]">
                        <td className="py-2.5 px-4 text-[#6B7280]">{e.expenseDate}</td>
                        <td className="py-2.5 px-4 text-[#1A1A2E]">{e.description}</td>
                        <td className="py-2.5 px-4 text-right text-[#A31D1D] font-mono">{FMT(e.amount)}</td>
                        <td className="py-2.5 px-4 text-[#6B7280] text-xs">{e.docRef}</td>
                        <td className="py-2.5 px-4">
                          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700">{e.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 text-[#9CA3AF]">
                <p className="text-sm">เลือกแผนงบประมาณเพื่อดูรายการใช้จ่าย</p>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: Transfer ─── */}
        {tab === "transfer" && (
          <div className="max-w-xl bg-white border border-[#D1D5DB] p-6">
            <h3 className="font-bold text-[#1A1A2E] mb-4">โอนงบประมาณระหว่างแผน</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#1A1A2E] mb-1">จากแผนงบ</label>
                <select className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813]">
                  <option value="">-- เลือก --</option>
                  {filteredPlans.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({FMT(p.remainingBudget)})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1A1A2E] mb-1">ไปยังแผนงบ</label>
                <select className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813]">
                  <option value="">-- เลือก --</option>
                  {filteredPlans.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1A1A2E] mb-1">จำนวนเงิน</label>
                <input type="number" className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813]" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1A1A2E] mb-1">เหตุผล</label>
                <textarea rows={2} className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813]" />
              </div>
              <button className="w-full px-4 py-2.5 bg-[#FDB813] text-[#1A1A2E] text-sm font-medium hover:bg-[#E5A800] transition-colors">
                ส่งคำขอโอนงบประมาณ
              </button>
            </div>
          </div>
        )}
      </div>
    </RequireRole>
  );
}
