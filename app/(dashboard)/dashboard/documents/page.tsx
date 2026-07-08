"use client";

import { useState, useEffect } from "react";
import RequireRole from "@/components/shared/require-role";

const POOL_TABS = [
  { key: "central", label: "คลังกลาง", desc: "เอกสารสาธารณะของคณะ" },
  { key: "dept", label: "คลังฝ่าย", desc: "เอกสารระดับแผนก" },
  { key: "personal", label: "คลังส่วนตัว", desc: "เอกสารส่วนตัว สูงสุด 5 GB" },
];

export default function DocumentsPage() {
  const [pool, setPool] = useState("central");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/storage?poolType=${pool}`)
      .then(r => r.json())
      .then(json => { if (json.success) setData(json.data); else setError(json.error?.message || "Error"); })
      .catch(() => setError("ไม่สามารถโหลดข้อมูลได้"))
      .finally(() => setLoading(false));
  }, [pool]);

  return (
    <RequireRole roles={["super_admin", "system_admin", "dean", "dept_admin", "user"]}>
      <div className="pt-0 px-6 pb-8">
        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">ข้อมูลเอกสาร</h1>
        <p className="text-sm text-[#6B7280] mb-6">จัดเก็บเอกสาร 3 ระดับ — คลังกลาง, คลังฝ่าย, คลังส่วนตัว</p>

        {/* Pool tabs */}
        <div className="flex gap-1 mb-5">
          {POOL_TABS.map(t => (
            <button key={t.key} onClick={() => setPool(t.key)}
              className={`px-5 py-2.5 text-sm font-medium transition-colors ${pool === t.key ? "bg-[#8B1515] text-white" : "bg-white text-[#6B7280] border border-[#D1D5DB] hover:border-[#FDB813]"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100"/>)}</div>
        ) : error ? (
          <div className="bg-[#FCE4E8] border border-[#A31D1D] p-4 text-sm text-[#A31D1D]">{error}</div>
        ) : data.length === 0 ? (
          <div className="bg-white border border-[#D1D5DB] py-12 text-center">
            <p className="text-[#6B7280] text-sm">ไม่มีเอกสารใน {POOL_TABS.find(t => t.key === pool)?.label}</p>
            <p className="text-xs text-[#9CA3AF] mt-1">อัปโหลดเอกสารใหม่เพื่อเริ่มต้น</p>
          </div>
        ) : (
          <div className="bg-white border border-[#D1D5DB]">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#F5F5F5] text-left"><th className="py-2.5 px-4 font-medium text-[#1A1A2E]">ชื่อไฟล์</th><th className="py-2.5 px-4 font-medium text-[#1A1A2E] hidden md:table-cell">เจ้าของ</th><th className="py-2.5 px-4 font-medium text-[#1A1A2E] hidden lg:table-cell">อัปเดตล่าสุด</th></tr></thead>
              <tbody>
                {data.map((d: any) => (
                  <tr key={d.id} className="border-t border-[#F5F5F5] hover:bg-[#FEF9E7]">
                    <td className="py-2.5 px-4"><p className="font-medium text-[#1A1A2E]">{d.title}</p></td>
                    <td className="py-2.5 px-4 text-[#6B7280] hidden md:table-cell">{d.owner?.firstNameTh} {d.owner?.lastNameTh}</td>
                    <td className="py-2.5 px-4 text-[#6B7280] hidden lg:table-cell text-xs">{d.updatedAt ? new Date(d.updatedAt).toLocaleDateString("th-TH") : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pool descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {POOL_TABS.map(t => (
            <div key={t.key} className="bg-white border border-[#D1D5DB] p-4">
              <h3 className="text-sm font-bold text-[#1A1A2E]">{t.label}</h3>
              <p className="text-xs text-[#6B7280] mt-1">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </RequireRole>
  );
}
