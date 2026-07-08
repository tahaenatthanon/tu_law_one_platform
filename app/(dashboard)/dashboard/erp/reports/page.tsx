"use client";

import { useState, useEffect } from "react";
import RequireRole from "@/components/shared/require-role";
import { useSession } from "next-auth/react";

type ReportTemplate = { id: string; name: string; module: string; description: string };
type ReportSchedule = { id: string; templateId: string; scheduleType: string; recipients: string; isActive: boolean; lastRunAt: string; nextRunAt: string };

const data_TEMPLATES: ReportTemplate[] = [
  { id: "rpt-1", name: "รายงานงบประมาณประจำเดือน", module: "งบประมาณ", description: "สรุปการใช้จ่ายงบประมาณรายเดือน" },
  { id: "rpt-2", name: "รายงานสินทรัพย์ถาวร", module: "ครุภัณฑ์", description: "ทะเบียนครุภัณฑ์และค่าเสื่อมราคา" },
  { id: "rpt-3", name: "รายงานการเงิน", module: "การเงิน", description: "งบการเงินรายไตรมาส" },
  { id: "rpt-4", name: "รายงานพัสดุคงคลัง", module: "พัสดุ", description: "รายงานสต็อกพัสดุคงเหลือ" },
  { id: "rpt-5", name: "รายงานผลการดำเนินงาน", module: "ทั่วไป", description: "สรุปผลการดำเนินงานคณะ" },
];

const data_SCHEDULES: ReportSchedule[] = [
  { id: "sch-1", templateId: "rpt-1", scheduleType: "monthly", recipients: "dean@law.tu.ac.th", isActive: true, lastRunAt: "2569-06-30", nextRunAt: "2569-07-31" },
  { id: "sch-2", templateId: "rpt-2", scheduleType: "quarterly", recipients: "admin@law.tu.ac.th", isActive: true, lastRunAt: "2569-06-30", nextRunAt: "2569-09-30" },
];

export default function ErpReportsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as Record<string, unknown>)?.roles as string[] ?? [];
  const isAdmin = userRoles.some((r) => ["super_admin", "system_admin"].includes(r));
  const [moduleFilter, setModuleFilter] = useState<string>("");

  useEffect(() => {
    fetch("/api/erp/reports")
      .then(function(r) { return r.json(); })
      .then(function(json) { if (json.success) setData(json.data); else setError(json.error?.message || "Error"); })
      .catch(function() { setError("ไม่สามารถโหลดข้อมูลได้"); })
      .finally(function() { setLoading(false); });
  }, []);

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-4 bg-gray-200 rounded w-1/3"/><div className="h-6 bg-gray-100 rounded"/></div></div>;
  if (error) return <div className="p-8 text-center"><div className="bg-[#FCE4E8] border border-[#A31D1D] p-4"><p className="text-sm text-[#A31D1D]">{error}</p></div></div>;

  const filteredReports = moduleFilter ? data_TEMPLATES.filter((r) => r.module === moduleFilter) : data_TEMPLATES;

  return (
    <RequireRole roles={["super_admin", "system_admin", "dean", "dept_admin", "user", "viewer"]}>
      <div className="pt-0 px-6 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">รายงาน</h1>
            <p className="text-sm text-[#6B7280]">รายงานสรุปจากทุกระบบ</p>
          </div>
        </div>

        {/* Quick Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white border border-[#D1D5DB] p-4">
            <h4 className="font-semibold text-[#1A1A2E] text-sm mb-3">📊 สรุปงบประมาณปี 2569</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs"><span className="text-[#6B7280]">งบประมาณรวม</span><span className="font-medium">2,500,000</span></div>
              <div className="w-full h-2 bg-[#F5F5F5]"><div className="h-2 bg-[#A31D1D]" style={{width:"72%"}} /></div>
              <div className="flex justify-between text-xs"><span className="text-[#6B7280]">ใช้ไปแล้ว</span><span className="font-medium text-[#A31D1D]">1,800,000</span></div>
              <div className="flex justify-between text-xs"><span className="text-[#6B7280]">คงเหลือ</span><span className="font-medium text-[#059669]">700,000</span></div>
            </div>
          </div>
          <div className="bg-white border border-[#D1D5DB] p-4">
            <h4 className="font-semibold text-[#1A1A2E] text-sm mb-3">🖥️ สรุปครุภัณฑ์</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs"><span className="text-[#6B7280]">ครุภัณฑ์ทั้งหมด</span><span className="font-medium">3 รายการ</span></div>
              <div className="flex justify-between text-xs"><span className="text-[#6B7280]">มูลค่าซื้อรวม</span><span className="font-medium">180,000</span></div>
              <div className="flex justify-between text-xs"><span className="text-[#6B7280]">กำลังซ่อมบำรุง</span><span className="font-medium text-yellow-600">1 รายการ</span></div>
            </div>
          </div>
        </div>

        {/* Report Templates */}
        <h2 className="font-bold text-[#1A1A2E] text-lg mb-3">📋 แม่แบบรายงาน</h2>
        <div className="flex gap-2 mb-4">
          {["", "budget", "finance", "inventory", "assets"].map((m) => (
            <button key={m} onClick={() => setModuleFilter(m)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                moduleFilter === m ? "bg-[#8B1515] text-white" : "bg-white text-[#6B7280] border border-[#D1D5DB] hover:border-[#FDB813]"
              }`}>
              {m === "" ? "ทั้งหมด" : m === "budget" ? "งบประมาณ" : m === "finance" ? "การเงิน" : m === "inventory" ? "พัสดุ" : "ครุภัณฑ์"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {filteredReports.map((r) => (
            <div key={r.id} className="bg-white border border-[#D1D5DB] p-4 hover:border-[#FDB813] transition-colors flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-[#1A1A2E] text-sm">{r.name}</h4>
                <p className="text-xs text-[#9CA3AF] mt-0.5">{r.description}</p>
                <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-[#F5F5F5] text-[#6B7280]">{r.module}</span>
              </div>
              <div className="flex gap-1 shrink-0">
                <button className="px-3 py-1.5 text-xs bg-[#FDB813] text-[#1A1A2E] font-medium hover:bg-[#E5A800] transition-colors">ดูรายงาน</button>
                <button className="px-3 py-1.5 text-xs bg-[#8B1515] text-white font-medium hover:bg-[#A31D1D] transition-colors">PDF</button>
              </div>
            </div>
          ))}
        </div>

        {/* Schedules (Admin only) */}
        {isAdmin && (
          <>
            <h2 className="font-bold text-[#1A1A2E] text-lg mb-3">⏰ กำหนดการออกรายงานอัตโนมัติ</h2>
            <div className="bg-white border border-[#D1D5DB] overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-[#F5F5F5] text-left">
                  <th className="py-3 px-4 font-medium text-[#1A1A2E]">รายงาน</th>
                  <th className="py-3 px-4 font-medium text-[#1A1A2E]">ความถี่</th>
                  <th className="py-3 px-4 font-medium text-[#1A1A2E]">ผู้รับ</th>
                  <th className="py-3 px-4 font-medium text-[#1A1A2E]">ล่าสุด</th>
                  <th className="py-3 px-4 font-medium text-[#1A1A2E]">ครั้งต่อไป</th>
                  <th className="py-3 px-4 font-medium text-[#1A1A2E]">สถานะ</th>
                </tr></thead>
                <tbody>
                  {data_SCHEDULES.map((s) => {
                    const tmpl = data_TEMPLATES.find((t) => t.id === s.templateId);
                    return (
                      <tr key={s.id} className="border-b border-[#F5F5F5] hover:bg-[#FEF9E7]">
                        <td className="py-2.5 px-4 text-[#1A1A2E] font-medium">{tmpl?.name ?? s.templateId}</td>
                        <td className="py-2.5 px-4 text-[#6B7280]">{s.scheduleType === "monthly" ? "รายเดือน" : "รายสัปดาห์"}</td>
                        <td className="py-2.5 px-4 text-[#6B7280] text-xs">{s.recipients}</td>
                        <td className="py-2.5 px-4 text-[#6B7280] text-xs">{s.lastRunAt}</td>
                        <td className="py-2.5 px-4 text-[#6B7280] text-xs">{s.nextRunAt}</td>
                        <td className="py-2.5 px-4">
                          <span className={`text-xs px-2 py-0.5 ${s.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {s.isActive ? "เปิด" : "ปิด"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </RequireRole>
  );
}
