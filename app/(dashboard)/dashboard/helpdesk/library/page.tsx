"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import RequireRole from "@/components/shared/require-role";

type Resource = { id: string; barcode: string; title: string; author?: string; publisher?: string; resourceType: string; category?: string; availableCopies: number; totalCopies: number; location?: string };
type Borrowing = { id: string; resourceId: string; userId: string; borrowDate: string; dueDate: string; returnDate?: string; status: string };
type Reservation = { id: string; resourceId: string; userId: string; reserveDate: string; status: string };

export default function LibraryPage() {
  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as any)?.roles ?? [];
  const canBorrow = userRoles.some((r: string) => ["super_admin","system_admin","dean","dept_admin","user"].includes(r));
  const [tab, setTab] = useState<"search" | "my-borrows">("search");
  const [resources, setResources] = useState<Resource[]>([]);
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState("");
  const [message, setMessage] = useState("");

  const fetchResources = useCallback(async (q?: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/library?q=${q ?? searchQ}`);
      const json = await res.json();
      if (json.success) setResources(json.data);
    } catch { setResources([]); }
    setLoading(false);
  }, [searchQ]);

  useEffect(() => { fetchResources(); }, []);

  const handleSearch = () => fetchResources(searchQ);

  const handleAction = async (action: "borrow" | "reserve", resourceId: string) => {
    setMessage("");
    try {
      const res = await fetch("/api/library", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, resourceId }),
      });
      const json = await res.json();
      setMessage(json.success ? (action === "borrow" ? "ยืมสำเร็จ" : "จองสำเร็จ") : json.error?.message ?? "เกิดข้อผิดพลาด");
      if (json.success) fetchResources();
    } catch { setMessage("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์"); }
  };

  const typeLabel = (t: string) => ({ book: "📖 หนังสือ", journal: "📰 วารสาร", thesis: "📄 วิทยานิพนธ์", media: "💿 สื่อ" }[t] ?? t);

  return (
    <RequireRole roles={["super_admin","system_admin","dean","dept_admin","user","viewer"]}>
    <div className="pt-0 px-6 pb-8">
      <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">ระบบห้องสมุด</h1>
      <p className="text-sm text-[#6B7280] mb-6">สืบค้นทรัพยากร ยืม-คืน และจองหนังสือ</p>

      <div className="flex gap-2 mb-4">
        {(["search", "my-borrows"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${tab === t ? "bg-[#8B1515] text-white" : "bg-white text-[#6B7280] border border-[#D1D5DB] hover:border-[#FDB813]"}`}>
            {t === "search" ? "🔍 สืบค้นทรัพยากร" : "📋 รายการยืมของฉัน"}
          </button>
        ))}
      </div>

      {message && <div className={`p-3 mb-4 text-sm ${message.includes("สำเร็จ") ? "bg-green-50 border border-green-300 text-green-700" : "bg-[#FCE4E8] border border-[#A31D1D] text-[#A31D1D]"}`}>{message}</div>}

      {tab === "search" && (
        <>
          <div className="flex gap-2 mb-4">
            <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="ค้นหาจากชื่อ, ผู้แต่ง, หรือบาร์โค้ด..." className="flex-1 px-4 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813]" />
            <button onClick={handleSearch} className="px-6 py-2 text-sm font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800]">ค้นหา</button>
          </div>
          {loading ? <p className="text-[#9CA3AF]">กำลังค้นหา...</p> : resources.length === 0 ? (
            <div className="text-center py-16 text-[#9CA3AF]"><p className="text-sm">ไม่พบทรัพยากร</p></div>
          ) : (
            <div className="space-y-2">
              {resources.map(r => (
                <div key={r.id} className="bg-white border border-[#D1D5DB] p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2"><span className="text-xs px-1.5 py-0.5 bg-gray-100 font-mono">{r.barcode}</span><span className="text-xs text-[#9CA3AF]">{typeLabel(r.resourceType)}</span></div>
                    <h3 className="font-medium text-[#1A1A2E] mt-1">{r.title}</h3>
                    <p className="text-xs text-[#6B7280] mt-0.5">{r.author ?? "-"} | {r.publisher ?? "-"}</p>
                    <p className="text-xs text-[#6B7280] mt-1">
                      <span className={r.availableCopies > 0 ? "text-green-600 font-medium" : "text-red-500"}>คงเหลือ {r.availableCopies}/{r.totalCopies} เล่ม</span>
                      {r.location && <span className="ml-2">| {r.location}</span>}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleAction("borrow", r.id)} disabled={r.availableCopies < 1}
                      className="px-3 py-1.5 text-xs font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800] disabled:opacity-40 disabled:cursor-not-allowed">ยืม</button>
                    <button onClick={() => handleAction("reserve", r.id)}
                      className="px-3 py-1.5 text-xs font-medium border border-[#FDB813] text-[#A31D1D] hover:bg-[#FDB813]/10">จอง</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "my-borrows" && (
        <div className="text-center py-16 text-[#9CA3AF]">
          <p className="text-sm">เชื่อมต่อกับ API เพื่อดูรายการยืมของคุณ</p>
          <button onClick={async () => { const r = await fetch("/api/library?type=borrowings"); const j = await r.json(); if (j.success) setBorrowings(j.data); }}
            className="mt-2 px-4 py-1.5 text-sm bg-gray-100 hover:bg-gray-200">โหลดรายการยืม</button>
          {borrowings.length > 0 && (
            <div className="mt-4 space-y-2 text-left max-w-lg mx-auto">
              {borrowings.map(b => (
                <div key={b.id} className="bg-white border border-[#D1D5DB] p-3 text-sm">
                  <span className={b.status === "returned" ? "text-green-600" : "text-[#A31D1D]"}>
                    {b.status === "returned" ? "✓ คืนแล้ว" : "📚 ยังไม่คืน"}
                  </span>
                  <span className="ml-2 text-[#9CA3AF]">กำหนดคืน {new Date(b.dueDate).toLocaleDateString("th-TH")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
    </RequireRole>
  );
}
