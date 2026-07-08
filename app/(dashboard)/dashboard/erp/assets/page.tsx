"use client";

import { useState, useEffect } from "react";
import RequireRole from "@/components/shared/require-role";
import { useSession } from "next-auth/react";

type Asset = { id: string; assetNo: string; name: string; category: string; brand: string; serialNo: string; purchaseDate: string; purchaseValue: number; currentValue: number; departmentName: string; location: string; status: string; warrantyEnd: string };
type Maintenance = { id: string; assetId: string; assetName: string; maintenanceDate: string; maintenanceType: string; cost: number; vendorName: string; nextDate: string; status: string };
type Depreciation = { year: number; depreciationAmount: number; accumulatedAmount: number; netValue: number };

const data_ASSETS: Asset[] = [
  { id: "ast-1", assetNo: "CRP-2024-001", name: "เครื่องคอมพิวเตอร์ Dell OptiPlex", category: "คอมพิวเตอร์", brand: "Dell", serialNo: "SN-DELL-001", purchaseDate: "2567-03-15", purchaseValue: 35000, currentValue: 28000, departmentName: "ฝ่าย IT", location: "ห้อง Server ชั้น 2", status: "ใช้งาน", warrantyEnd: "2570-03-15" },
  { id: "ast-2", assetNo: "CRP-2024-002", name: "โปรเจคเตอร์ Epson EB-X41", category: "โสตทัศนูปกรณ์", brand: "Epson", serialNo: "SN-EPS-002", purchaseDate: "2567-06-01", purchaseValue: 25000, currentValue: 22000, departmentName: "ฝ่ายวิชาการ", location: "ห้องประชุม 301", status: "ใช้งาน", warrantyEnd: "2569-06-01" },
  { id: "ast-3", assetNo: "CRP-2023-015", name: "เครื่องถ่ายเอกสาร Ricoh MP 2555", category: "เครื่องใช้สำนักงาน", brand: "Ricoh", serialNo: "SN-RIC-015", purchaseDate: "2566-01-10", purchaseValue: 120000, currentValue: 60000, departmentName: "ฝ่ายบริหาร", location: "ชั้น 1 อาคารคณะ", status: "ซ่อมบำรุง", warrantyEnd: "2568-01-10" },
];

const data_MAINTENANCE: Maintenance[] = [
  { id: "mt-1", assetId: "ast-3", assetName: "เครื่องถ่ายเอกสาร Ricoh", maintenanceDate: "2569-06-15", maintenanceType: "ซ่อมตามรอบ", cost: 2500, vendorName: "บริษัท ริโก้ ประเทศไทย", nextDate: "2569-12-15", status: "completed" },
  { id: "mt-2", assetId: "ast-1", assetName: "เครื่องคอมพิวเตอร์ Dell", maintenanceDate: "2569-05-01", maintenanceType: "ตรวจเช็คประจำปี", cost: 0, vendorName: "ฝ่าย IT", nextDate: "2570-05-01", status: "completed" },
];

const FMT = (n: number) => n.toLocaleString("th-TH");
const STATUS_MAP: Record<string, { cls: string; label: string }> = {
  "ใช้งาน": { cls: "bg-green-100 text-green-700", label: "ใช้งาน" },
  "ซ่อมบำรุง": { cls: "bg-yellow-100 text-yellow-700", label: "ซ่อมบำรุง" },
  "รอจำหน่าย": { cls: "bg-red-100 text-red-700", label: "รอจำหน่าย" },
  "จำหน่ายแล้ว": { cls: "bg-gray-100 text-gray-500", label: "จำหน่ายแล้ว" },
};

const data_DEPRECIATION: Depreciation[] = [
  { year: 2567, depreciationAmount: 7000, accumulatedAmount: 7000, netValue: 28000 },
  { year: 2568, depreciationAmount: 7000, accumulatedAmount: 14000, netValue: 21000 },
  { year: 2569, depreciationAmount: 7000, accumulatedAmount: 21000, netValue: 14000 },
];

export default function ErpAssetsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as Record<string, unknown>)?.roles as string[] ?? [];
  const isAdmin = userRoles.some((r) => ["super_admin", "system_admin"].includes(r));

  const [tab, setTab] = useState<"list" | "maintenance" | "depreciation">("list");
  const [selectedAssetId, setSelectedAssetId] = useState<string>("ast-1");

  useEffect(() => {
    fetch("/api/erp/assets")
      .then(function(r) { return r.json(); })
      .then(function(json) { if (json.success) setData(json.data); else setError(json.error?.message || "Error"); })
      .catch(function() { setError("ไม่สามารถโหลดข้อมูลได้"); })
      .finally(function() { setLoading(false); });
  }, []);

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-4 bg-gray-200 rounded w-1/3"/><div className="h-6 bg-gray-100 rounded"/></div></div>;
  if (error) return <div className="p-8 text-center"><div className="bg-[#FCE4E8] border border-[#A31D1D] p-4"><p className="text-sm text-[#A31D1D]">{error}</p></div></div>;

  const selectedAsset = data_ASSETS.find((a) => a.id === selectedAssetId);
  const assetMaintenance = data_MAINTENANCE.filter((m) => m.assetId === selectedAssetId);

  const tabs = [
    { key: "list" as const, label: "🏢 รายการครุภัณฑ์" },
    { key: "maintenance" as const, label: "🔧 ซ่อมบำรุง" },
    ...(isAdmin ? [{ key: "depreciation" as const, label: "📉 ค่าเสื่อม" }] : []),
  ];

  return (
    <RequireRole roles={["super_admin", "system_admin", "dean", "dept_admin", "user", "viewer"]}>
      <div className="pt-0 px-6 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">ระบบครุภัณฑ์</h1>
            <p className="text-sm text-[#6B7280]">บริหารจัดการทรัพย์สินถาวรของคณะ</p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {[
            { label: "ครุภัณฑ์ทั้งหมด", value: `${data_ASSETS.length} รายการ`, color: "#1A1A2E" },
            { label: "มูลค่ารวม", value: FMT(data_ASSETS.reduce((s, a) => s + a.purchaseValue, 0)), color: "#8B1515" },
            { label: "มูลค่าปัจจุบัน", value: FMT(data_ASSETS.reduce((s, a) => s + a.currentValue, 0)), color: "#059669" },
            { label: "รอซ่อม", value: `${data_ASSETS.filter((a) => a.status === "maintenance").length} รายการ`, color: "#FDB813" },
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
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${tab === t.key ? "bg-[#FDB813] text-[#1A1A2E] shadow-sm" : "text-[#6B7280] hover:text-[#1A1A2E]"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ─── List Tab ─── */}
        {tab === "list" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-2">
              {data_ASSETS.map((a) => (
                <button key={a.id} onClick={() => setSelectedAssetId(a.id)}
                  className={`w-full text-left p-3 border transition-colors ${selectedAssetId === a.id ? "border-[#FDB813] bg-[#FEF9E7]" : "border-[#D1D5DB] bg-white hover:border-[#FDB813]"}`}>
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-[#1A1A2E]">{a.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 ${STATUS_MAP[a.status]?.cls ?? ""}`}>{STATUS_MAP[a.status]?.label ?? a.status}</span>
                  </div>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">{a.assetNo} · {a.departmentName}</p>
                </button>
              ))}
            </div>
            <div className="lg:col-span-2 bg-white border border-[#D1D5DB] p-6">
              {selectedAsset ? (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    ["รหัสครุภัณฑ์", selectedAsset.assetNo], ["ชื่อ", selectedAsset.name],
                    ["หมวดหมู่", selectedAsset.category], ["ยี่ห้อ", selectedAsset.brand],
                    ["Serial No.", selectedAsset.serialNo], ["วันที่ซื้อ", selectedAsset.purchaseDate],
                    ["มูลค่าซื้อ", FMT(selectedAsset.purchaseValue)], ["มูลค่าปัจจุบัน", FMT(selectedAsset.currentValue)],
                    ["แผนก", selectedAsset.departmentName], ["ตำแหน่ง", selectedAsset.location],
                    ["สถานะ", selectedAsset.status], ["หมดประกัน", selectedAsset.warrantyEnd],
                  ].map(([label, value], i) => (
                    <div key={i}>
                      <p className="text-xs text-[#9CA3AF]">{label}</p>
                      <p className="text-[#1A1A2E] font-medium">{value}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-[#9CA3AF] text-sm text-center py-8">เลือกครุภัณฑ์เพื่อดูรายละเอียด</p>}
            </div>
          </div>
        )}

        {/* ─── Maintenance Tab ─── */}
        {tab === "maintenance" && (
          <div className="bg-white border border-[#D1D5DB] overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#F5F5F5] text-left">
                <th className="py-3 px-4 font-medium text-[#1A1A2E]">ครุภัณฑ์</th><th className="py-3 px-4 font-medium text-[#1A1A2E]">วันที่</th>
                <th className="py-3 px-4 font-medium text-[#1A1A2E]">ประเภท</th><th className="py-3 px-4 font-medium text-[#1A1A2E] text-right">ค่าใช้จ่าย</th>
                <th className="py-3 px-4 font-medium text-[#1A1A2E]">ผู้ให้บริการ</th><th className="py-3 px-4 font-medium text-[#1A1A2E]">ครั้งถัดไป</th>
                <th className="py-3 px-4 font-medium text-[#1A1A2E]">สถานะ</th>
              </tr></thead>
              <tbody>
                {data_MAINTENANCE.map((m) => (
                  <tr key={m.id} className="border-b border-[#F5F5F5] hover:bg-[#FEF9E7]">
                    <td className="py-2.5 px-4 text-[#1A1A2E] font-medium">{m.assetName}</td>
                    <td className="py-2.5 px-4 text-[#6B7280]">{m.maintenanceDate}</td>
                    <td className="py-2.5 px-4 text-[#6B7280]">{m.maintenanceType}</td>
                    <td className="py-2.5 px-4 text-right text-[#A31D1D] font-mono">{FMT(m.cost)}</td>
                    <td className="py-2.5 px-4 text-[#1A1A2E]">{m.vendorName}</td>
                    <td className="py-2.5 px-4 text-[#6B7280]">{m.nextDate}</td>
                    <td className="py-2.5 px-4">
                      <span className={`text-xs px-2 py-0.5 ${m.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {m.status === "completed" ? "เสร็จ" : "กำลังดำเนินการ"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── Depreciation Tab (Admin only) ─── */}
        {tab === "depreciation" && selectedAsset && (
          <div className="bg-white border border-[#D1D5DB] p-6">
            <h3 className="font-bold text-[#1A1A2E] mb-4">ตารางค่าเสื่อม — {selectedAsset.name}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-[#F5F5F5] text-left">
                  <th className="py-3 px-4 font-medium text-[#1A1A2E]">ปี</th>
                  <th className="py-3 px-4 font-medium text-[#1A1A2E] text-right">ค่าเสื่อม/ปี</th>
                  <th className="py-3 px-4 font-medium text-[#1A1A2E] text-right">ค่าเสื่อมสะสม</th>
                  <th className="py-3 px-4 font-medium text-[#1A1A2E] text-right">มูลค่าสุทธิ</th>
                </tr></thead>
                <tbody>
                  {data_DEPRECIATION.map((d) => (
                    <tr key={d.year} className="border-b border-[#F5F5F5]">
                      <td className="py-2.5 px-4 text-[#1A1A2E] font-medium">{d.year + 543}</td>
                      <td className="py-2.5 px-4 text-right text-[#A31D1D] font-mono">{FMT(d.depreciationAmount)}</td>
                      <td className="py-2.5 px-4 text-right text-[#6B7280] font-mono">{FMT(d.accumulatedAmount)}</td>
                      <td className="py-2.5 px-4 text-right text-green-600 font-mono">{FMT(d.netValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </RequireRole>
  );
}
