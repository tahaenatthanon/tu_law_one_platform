"use client";

import { useState, useEffect } from "react";
import RequireRole from "@/components/shared/require-role";

/* ─── Types ─── */
type InventoryItem = { id: string; itemCode: string; name: string; category: string; unit: string; unitPrice: number; minStock: number };
type StockRecord = { itemId: string; locationName: string; quantity: number };
type Transaction = { id: string; itemName: string; transactionType: string; quantity: number; transactionDate: string; referenceDoc: string; note: string };
type InventoryCategory = { id: number; name: string; itemCount: number };

const data_ITEMS: InventoryItem[] = [
  { id: "inv-1", itemCode: "MAT-001", name: "กระดาษ A4 Double A", category: "เครื่องเขียน", unit: "รีม", unitPrice: 120, minStock: 50 },
  { id: "inv-2", itemCode: "MAT-002", name: "ตลับหมึก HP LaserJet", category: "วัสดุคอมพิวเตอร์", unit: "ตลับ", unitPrice: 2500, minStock: 10 },
  { id: "inv-3", itemCode: "MAT-003", name: "แฟ้มเอกสาร 3 นิ้ว", category: "เครื่องเขียน", unit: "เล่ม", unitPrice: 45, minStock: 100 },
  { id: "inv-4", itemCode: "MAT-004", name: "ปลั๊กไฟ 6 ช่อง", category: "อุปกรณ์ไฟฟ้า", unit: "อัน", unitPrice: 350, minStock: 20 },
];

const data_STOCK: StockRecord[] = [
  { itemId: "inv-1", locationName: "คลังพัสดุกลาง", quantity: 200 },
  { itemId: "inv-1", locationName: "ฝ่ายวิชาการ", quantity: 30 },
  { itemId: "inv-2", locationName: "คลังพัสดุกลาง", quantity: 8 },
  { itemId: "inv-3", locationName: "คลังพัสดุกลาง", quantity: 150 },
  { itemId: "inv-4", locationName: "ฝ่าย IT", quantity: 15 },
];

const data_CATEGORIES: InventoryCategory[] = [
  { id: 1, name: "เครื่องเขียน", itemCount: 2 },
  { id: 2, name: "วัสดุคอมพิวเตอร์", itemCount: 1 },
  { id: 3, name: "อุปกรณ์ไฟฟ้า", itemCount: 1 },
];

const FMT = (n: number) => n.toLocaleString("th-TH");
const data_TRANSACTIONS: Transaction[] = [
  { id: "tx-1", itemName: "กระดาษ A4 Double A", transactionType: "รับเข้า", quantity: 50, transactionDate: "2569-07-01", referenceDoc: "PR-001", note: "จัดซื้อตามใบขอซื้อ" },
  { id: "tx-2", itemName: "ตลับหมึก HP LaserJet", transactionType: "เบิกจ่าย", quantity: -2, transactionDate: "2569-06-28", referenceDoc: "IS-015", note: "เบิกโดยฝ่ายวิชาการ" },
  { id: "tx-3", itemName: "ปลั๊กไฟ 6 ช่อง", transactionType: "เบิกจ่าย", quantity: -5, transactionDate: "2569-06-20", referenceDoc: "IS-012", note: "เบิกโดยฝ่าย IT" },
  { id: "tx-4", itemName: "แฟ้มเอกสาร 3 นิ้ว", transactionType: "รับเข้า", quantity: 100, transactionDate: "2569-06-15", referenceDoc: "PR-002", note: "จัดซื้อตามใบขอซื้อ" },
];

export default function ErpInventoryPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"items" | "transactions">("items");
  const [catFilter, setCatFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/erp/inventory")
      .then(function(r) { return r.json(); })
      .then(function(json) { if (json.success) setData(json.data); else setError(json.error?.message || "Error"); })
      .catch(function() { setError("ไม่สามารถโหลดข้อมูลได้"); })
      .finally(function() { setLoading(false); });
  }, []);

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-4 bg-gray-200 rounded w-1/3"/><div className="h-6 bg-gray-100 rounded"/></div></div>;
  if (error) return <div className="p-8 text-center"><div className="bg-[#FCE4E8] border border-[#A31D1D] p-4"><p className="text-sm text-[#A31D1D]">{error}</p></div></div>;

  const filteredItems = data_ITEMS.filter((i) => {
    if (catFilter && i.category !== catFilter) return false;
    if (search && !i.name.toLowerCase().includes(search.toLowerCase()) && !i.itemCode.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <RequireRole roles={["super_admin", "system_admin", "dean", "dept_admin", "user", "viewer"]}>
      <div className="pt-0 px-6 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">ระบบพัสดุ</h1>
            <p className="text-sm text-[#6B7280]">จัดการวัสดุและคลังสินค้า</p>
          </div>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {data_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setCatFilter(catFilter === cat.name ? "" : cat.name); setTab("items"); }}
              className={`text-left bg-white border p-4 transition-colors ${
                catFilter === cat.name ? "border-[#FDB813] bg-[#FEF9E7]" : "border-[#D1D5DB] hover:border-[#FDB813]"
              }`}
            >
              <p className="text-xs text-[#6B7280] mb-1">{cat.name}</p>
              <p className="text-2xl font-bold text-[#1A1A2E]">{cat.itemCount}</p>
              <p className="text-xs text-[#9CA3AF] mt-1">รายการ</p>
            </button>
          ))}
        </div>

        {/* Search + Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex gap-1 bg-[#F5F5F5] p-1 rounded">
            {(["items", "transactions"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${tab === t ? "bg-[#FDB813] text-[#1A1A2E] shadow-sm" : "text-[#6B7280] hover:text-[#1A1A2E]"}`}>
                {t === "items" ? "📦 รายการพัสดุ" : "🔄 ประวัติการเคลื่อนไหว"}
              </button>
            ))}
          </div>
          <input type="text" placeholder="🔍 ค้นหาพัสดุ..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813] w-56" />
        </div>

        {tab === "items" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-[#D1D5DB] overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-[#F5F5F5] text-left">
                  <th className="py-3 px-4 font-medium text-[#1A1A2E]">รหัส</th><th className="py-3 px-4 font-medium text-[#1A1A2E]">รายการ</th>
                  <th className="py-3 px-4 font-medium text-[#1A1A2E]">หมวด</th><th className="py-3 px-4 font-medium text-[#1A1A2E] text-right">ราคา/หน่วย</th>
                  <th className="py-3 px-4 font-medium text-[#1A1A2E] text-right">คงเหลือ</th><th className="py-3 px-4 font-medium text-[#1A1A2E]"></th>
                </tr></thead>
                <tbody>
                  {filteredItems.map((item) => {
                    const totalStock = data_STOCK.filter((s) => s.itemId === item.id).reduce((sum, s) => sum + s.quantity, 0);
                    const isLow = totalStock < item.minStock;
                    return (
                      <tr key={item.id} className={`border-b border-[#F5F5F5] hover:bg-[#FEF9E7] ${selectedItem === item.id ? "bg-[#FEF9E7]" : ""}`}>
                        <td className="py-2.5 px-4 text-[#6B7280] text-xs">{item.itemCode}</td>
                        <td className="py-2.5 px-4 text-[#1A1A2E] font-medium">{item.name}</td>
                        <td className="py-2.5 px-4 text-[#6B7280] text-xs">{item.category}</td>
                        <td className="py-2.5 px-4 text-right text-[#1A1A2E] font-mono">{FMT(item.unitPrice)}</td>
                        <td className="py-2.5 px-4 text-right">
                          <span className={`font-mono ${isLow ? "text-red-500 font-bold" : "text-green-600"}`}>{totalStock} {item.unit}</span>
                          {isLow && <span className="ml-1 text-xs text-red-500">⚠️</span>}
                        </td>
                        <td className="py-2.5 px-4">
                          <button onClick={() => setSelectedItem(selectedItem === item.id ? null : item.id)} className="text-xs text-[#A31D1D] hover:underline">สต็อก</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div>
              {selectedItem ? (
                <div className="bg-white border border-[#D1D5DB] p-4">
                  <h3 className="font-bold text-[#1A1A2E] mb-3">📍 ตำแหน่งจัดเก็บ</h3>
                  {data_STOCK.filter((s) => s.itemId === selectedItem).map((s, i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-[#F5F5F5] last:border-0 text-sm">
                      <span className="text-[#1A1A2E]">{s.locationName}</span>
                      <span className="font-mono font-bold text-[#1A1A2E]">{s.quantity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-dashed border-[#D1D5DB] flex items-center justify-center h-48">
                  <p className="text-[#9CA3AF] text-sm">คลิก &quot;สต็อก&quot; เพื่อดูตำแหน่งจัดเก็บ</p>
                </div>
              )}
              <div className="mt-4 bg-[#FCE4E8] border border-[#A31D1D] p-4">
                <h3 className="text-sm font-bold text-[#A31D1D] mb-2">⚠️ รายการที่ต่ำกว่าจุดสั่งซื้อ</h3>
                {data_ITEMS.filter((item) => data_STOCK.filter((s) => s.itemId === item.id).reduce((sum, s) => sum + s.quantity, 0) < item.minStock).map((item) => (
                  <div key={item.id} className="flex justify-between text-sm py-1">
                    <span className="text-[#A31D1D]">{item.name}</span>
                    <span className="font-mono text-[#A31D1D]">{data_STOCK.filter((s) => s.itemId === item.id).reduce((sum, s) => sum + s.quantity, 0)} / {item.minStock} {item.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#D1D5DB] overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#F5F5F5] text-left">
                <th className="py-3 px-4 font-medium text-[#1A1A2E]">วันที่</th><th className="py-3 px-4 font-medium text-[#1A1A2E]">รายการ</th>
                <th className="py-3 px-4 font-medium text-[#1A1A2E]">ประเภท</th><th className="py-3 px-4 font-medium text-[#1A1A2E] text-right">จำนวน</th>
                <th className="py-3 px-4 font-medium text-[#1A1A2E]">เลขเอกสาร</th><th className="py-3 px-4 font-medium text-[#1A1A2E]">หมายเหตุ</th>
              </tr></thead>
              <tbody>
                {data_TRANSACTIONS.map((tx) => (
                  <tr key={tx.id} className="border-b border-[#F5F5F5] hover:bg-[#FEF9E7]">
                    <td className="py-2.5 px-4 text-[#6B7280]">{tx.transactionDate}</td>
                    <td className="py-2.5 px-4 text-[#1A1A2E] font-medium">{tx.itemName}</td>
                    <td className="py-2.5 px-4"><span className={`text-xs px-2 py-0.5 ${tx.transactionType === "รับเข้า" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{tx.transactionType}</span></td>
                    <td className="py-2.5 px-4 text-right font-mono text-[#1A1A2E]">{tx.quantity}</td>
                    <td className="py-2.5 px-4 text-[#6B7280] text-xs">{tx.referenceDoc}</td>
                    <td className="py-2.5 px-4 text-[#9CA3AF] text-xs">{tx.note || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </RequireRole>
  );
}
