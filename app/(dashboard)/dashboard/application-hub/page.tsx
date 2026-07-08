"use client";

import { useState, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  applications,
  appCategories,
  calendarEvents,
  type Application,
  type AppStatus,
  type CalendarEvent,
  type UserRole,
} from "@/lib/app-data";

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */

const ALL_ACCESS_ROLES: UserRole[] = ["super_admin", "system_admin"];

const statusMap: Record<AppStatus, { label: string; dot: string; text: string }> = {
  online: { label: "ออนไลน์", dot: "bg-green-500", text: "text-green-600" },
  offline: { label: "ออฟไลน์", dot: "bg-red-500", text: "text-red-500" },
  maintenance: { label: "กำลังบำรุงรักษา", dot: "bg-yellow-500", text: "text-yellow-600" },
};

const eventCategoryMap: Record<CalendarEvent["category"], { label: string; dot: string; text: string; hex: string }> = {
  meeting: { label: "ประชุม", dot: "bg-purple-500", text: "text-purple-600", hex: "#a855f7" },
  seminar: { label: "สัมมนา", dot: "bg-blue-500", text: "text-blue-600", hex: "#3b82f6" },
  exam: { label: "สอบ", dot: "bg-orange-500", text: "text-orange-600", hex: "#f97316" },
  holiday: { label: "วันหยุด", dot: "bg-red-500", text: "text-red-500", hex: "#ef4444" },
  deadline: { label: "กำหนดส่ง", dot: "bg-pink-500", text: "text-pink-600", hex: "#ec4899" },
};

const THAI_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

function formatThaiDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`;
}

function isAppAllowed(app: Application, roles: string[]): boolean {
  if (!app.allowedRoles || app.allowedRoles.length === 0) return true;
  if (roles.some((r) => ALL_ACCESS_ROLES.includes(r as UserRole))) return true;
  return app.allowedRoles.some((r) => roles.includes(r));
}

/* ═══════════════════════════════════════════════════════════════
   App Icon Card
   ═══════════════════════════════════════════════════════════════ */

function AppIcon({ app, pinned, onTogglePin, onClick }: {
  app: Application; pinned: boolean; onTogglePin: (id: string) => void; onClick: (app: Application) => void;
}) {
  const s = statusMap[app.status];
  const isOffline = app.status === "offline";
  const isMaintenance = app.status === "maintenance";
  const isFolder = app.url === "#";

  const domainColors: Record<string, string> = {
    erp: "bg-[#8B1515] hover:bg-[#A31D1D]", eoffice: "bg-[#8B1515] hover:bg-[#A31D1D]",
    storage: "bg-[#8B1515] hover:bg-[#A31D1D]", academic: "bg-[#8B1515] hover:bg-[#A31D1D]",
    hr: "bg-[#8B1515] hover:bg-[#A31D1D]",
  };
  const iconBg = isFolder ? (domainColors[app.category] ?? "bg-[#8B1515] hover:bg-[#A31D1D]") : (isOffline ? "bg-gray-400 hover:bg-gray-500" : "bg-[#8B1515] hover:bg-[#A31D1D]");

  return (
    <div className="relative group">
      {/* Icon */}
      <button
        onClick={() => onClick(app)}
        className={`w-full aspect-square transition-colors flex flex-col items-center justify-center gap-1 shadow-sm hover:shadow-md relative ${iconBg}`}
      >
        <svg className={`w-8 h-8 ${isOffline ? "text-gray-200" : "text-[#FDB813]"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={app.icon} />
        </svg>

        {/* Offline overlay */}
        {isOffline && (
          <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
        )}

        {/* Maintenance overlay */}
        {isMaintenance && (
          <div className="absolute bottom-1 right-1 bg-yellow-500 text-white text-[8px] font-bold px-1 rounded">
            อป
          </div>
        )}
      </button>

      {/* Pin button */}
      <button
        onClick={(e) => { e.stopPropagation(); onTogglePin(app.id); }}
        className={`absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center shadow-sm transition-all ${pinned ? "bg-[#FDB813] text-[#8B1515] opacity-100" : "bg-white text-[#9CA3AF] opacity-0 group-hover:opacity-100"}`}
        title={pinned ? "ถอนหมุด" : "ปักหมุด"}
      >
        <svg className="w-3.5 h-3.5" fill={pinned ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      </button>

      {/* Name below */}
      <div className="mt-1.5 text-center">
        <p className={`text-sm font-medium leading-tight line-clamp-2 ${isOffline ? "text-[#9CA3AF]" : "text-[#1A1A2E]"}`}>{app.name}</p>
        <p className={`text-xs mt-0.5 flex items-center justify-center gap-1 ${isOffline ? "text-red-400" : s.text}`}>
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
        </p>
      </div>
    </div>
  );
}

/* ─── App List Item (List View) ─── */
function AppListItem({ app, pinned, onTogglePin, onClick }: {
  app: Application; pinned: boolean; onTogglePin: (id: string) => void; onClick: (app: Application) => void;
}) {
  const s = statusMap[app.status];
  const isOffline = app.status === "offline";
  return (
    <div className="flex items-center gap-3 bg-white border border-[#D1D5DB] p-3 hover:border-[#FDB813] transition-colors group">
      {/* Icon */}
      <button onClick={() => onClick(app)} className="w-10 h-10 flex items-center justify-center shrink-0 bg-[#8B1515] hover:bg-[#A31D1D] transition-colors">
        <svg className="w-5 h-5 text-[#FDB813]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={app.icon} />
        </svg>
      </button>
      {/* Info */}
      <button onClick={() => onClick(app)} className="flex-1 min-w-0 text-left">
        <p className="text-sm font-medium text-[#1A1A2E] truncate">{app.name}</p>
        <p className="text-[11px] text-[#6B7280] truncate">{app.description}</p>
      </button>
      {/* Status */}
      <span className={`text-[11px] flex items-center gap-1 shrink-0 ${s.text}`}>
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
      </span>
      {/* Pin */}
      <button onClick={(e) => { e.stopPropagation(); onTogglePin(app.id); }}
        className={`shrink-0 p-1 transition-colors ${pinned ? "text-[#FDB813]" : "text-[#D1D5DB] hover:text-[#FDB813]"}`}
        title={pinned ? "เลิกปักหมุด" : "ปักหมุด"}>
        <svg className="w-4 h-4" fill={pinned ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Login Gate Modal — ก่อนเข้าใช้งาน App
   ═══════════════════════════════════════════════════════════════ */

function LoginGate({ app, onClose }: { app: Application; onClose: () => void }) {
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isFolder = app.url === "#";
  const isOffline = app.status === "offline";
  const isMaintenance = app.status === "maintenance";
  const userEmail = session?.user?.email ?? "";
  const [authenticated, setAuthenticated] = useState(false);

  const folderBg = "bg-[#8B1515]";

  const handleEnter = async () => {
    if (!email || !password) {
      setError("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }
    if (email !== userEmail) {
      setError("อีเมลไม่ตรงกับบัญชีที่เข้าสู่ระบบ");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/callback/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          email, password,
          csrfToken: "verify",
          callbackUrl: "/dashboard",
          json: "true",
        }).toString(),
      });
      if (res.ok) {
        if (isFolder) {
          setAuthenticated(true);
        } else {
          window.open(app.url, "_blank");
          onClose();
        }
      } else {
        setError("รหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง");
      }
    } catch {
      setError("ไม่สามารถยืนยันตัวตนได้ กรุณาลองอีกครั้ง");
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white border border-[#FDB813] p-8 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* App preview */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-16 h-16 flex items-center justify-center shrink-0 ${isOffline ? "bg-gray-400" : folderBg}`}>
            <svg className={`w-8 h-8 ${isOffline ? "text-gray-200" : "text-[#FDB813]"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={app.icon} />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#1A1A2E]">{app.name}</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">{app.description}</p>
          </div>
        </div>

        {isOffline && (
          <div className="bg-[#FCE4E8] border border-[#A31D1D] p-3 mb-4 text-xs text-[#A31D1D]">
            <p className="font-semibold">⚠️ ระบบนี้ไม่สามารถเข้าใช้งานได้ในขณะนี้</p>
            <p>ระบบอยู่ในสถานะออฟไลน์ — กรุณาติดต่อผู้ดูแลระบบ</p>
          </div>
        )}
        {isMaintenance && (
          <div className="bg-[#FFF8E1] border border-[#FDB813] p-3 mb-4 text-xs text-[#8B6914]">
            <p className="font-semibold">🔧 ระบบนี้อยู่ในระหว่างการบำรุงรักษา</p>
            <p>คุณยังสามารถเข้าใช้งานได้ แต่อาจพบปัญหาบางประการ</p>
          </div>
        )}

        {/* Folder — show subApps after authentication */}
        {isFolder && authenticated && app.subApps.length > 0 && (
          <div className="space-y-1.5 mb-4">
            {app.subApps.map((sub) => {
              const ss = statusMap[sub.status];
              return (
                <a key={sub.id} href={sub.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 border border-[#D1D5DB] hover:border-[#FDB813] hover:bg-[#FDB813]/5 transition-colors group">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1A1A2E]">{sub.name}</p>
                    <p className="text-[10px] text-[#6B7280] mt-0.5">{sub.description}</p>
                  </div>
                  <span className={`text-[10px] flex items-center gap-1 shrink-0 ml-2 ${ss.text}`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${ss.dot}`} />{ss.label}
                  </span>
                </a>
              );
            })}
          </div>
        )}

        {/* Login form — only for online/maintenance */}
        {!isOffline && !(isFolder && authenticated) && (
          <div className="space-y-3 mb-4">
            <p className="text-xs text-[#6B7280]">🔐 ยืนยันตัวตนอีกครั้งก่อนเข้าใช้งานระบบ</p>
            <div>
              <label className="block text-[11px] font-medium text-[#1A1A2E] mb-1">อีเมล</label>
              <input
                type="email" value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder={userEmail}
                className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#1A1A2E] mb-1">รหัสผ่าน</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 pr-10 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30"
                  onKeyDown={(e) => e.key === "Enter" && handleEnter()}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#1A1A2E]">
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {error && (
              <div className="p-2 bg-[#FCE4E8] border border-[#A31D1D] text-[11px] text-[#A31D1D] flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium border border-[#D1D5DB] text-[#6B7280] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer transition-all">
            {isOffline || (isFolder && authenticated) ? "ปิด" : "ยกเลิก"}
          </button>
          {isOffline ? (
            <div className="flex-1 px-4 py-2.5 text-sm font-semibold text-center bg-gray-200 text-gray-400 rounded select-none">
              ไม่สามารถเข้าใช้งานได้
            </div>
          ) : isFolder && authenticated ? null : (
            <button onClick={handleEnter} disabled={isLoading || !email || !password}
              className={`flex-1 px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isMaintenance ? "bg-[#FDB813]/70 text-[#1A1A2E] hover:bg-[#E5A800] focus:ring-[#FDB813]/50" : "bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800] focus:ring-[#FDB813]/50"}`}>
              {isLoading ? "กำลังตรวจสอบ..." : isMaintenance ? "เข้าใช้งาน (อาจมีปัญหา)" : "เข้าใช้งาน"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Advanced Search Modal
   ═══════════════════════════════════════════════════════════════ */

function AdvancedSearchModal({
  onApply, onClose,
}: {
  onApply: (filters: { keyword: string; dateFrom: string; dateTo: string; categories: string[] }) => void;
  onClose: () => void;
}) {
  const [keyword, setKeyword] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set());

  const toggleCat = (id: string) => {
    setSelectedCats((prev) => { const next = new Set(prev); if (next.has(id)) { next.delete(id); } else { next.add(id); } return next; });
  };

  const handleApply = () => {
    onApply({ keyword, dateFrom, dateTo, categories: [...selectedCats] });
    onClose();
  };

  const handleReset = () => {
    setKeyword(""); setDateFrom(""); setDateTo(""); setSelectedCats(new Set());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white border border-[#FDB813] p-6 w-full max-w-lg mx-4 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-[#8B1515]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-sm font-semibold text-[#1A1A2E]">ค้นหาขั้นสูง</h3>
        </div>

        {/* Keyword */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-[#1A1A2E] mb-1">คำสำคัญ</label>
          <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30" placeholder="ค้นหาจากชื่อ, คำอธิบาย หรือระบบย่อย..." />
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-[#1A1A2E] mb-1">วันที่เริ่ม</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#1A1A2E] mb-1">วันที่สิ้นสุด</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30" />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-[#1A1A2E] mb-1">หมวดหมู่</label>
          <div className="flex flex-wrap gap-1.5">
            {appCategories.map((cat) => (
              <button key={cat.id} onClick={() => toggleCat(cat.id)}
                className={`px-2.5 py-1 text-[11px] rounded-full border transition-colors ${selectedCats.has(cat.id) ? "bg-[#8B1515] text-white border-[#8B1515]" : "bg-white text-[#6B7280] border-[#D1D5DB] hover:border-[#FDB813]"}`}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={handleReset}
            className="px-4 py-2 text-sm font-medium border border-[#D1D5DB] text-[#6B7280] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer transition-all">
            ล้าง
          </button>
          <button onClick={onClose}
            className="px-4 py-2 text-sm font-medium border border-[#D1D5DB] text-[#6B7280] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer transition-all">
            ปิด
          </button>
          <button onClick={handleApply}
            className="ml-auto px-4 py-2 text-sm font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800] focus:outline-none focus:ring-2 focus:ring-[#FDB813]/50 focus:ring-offset-2 cursor-pointer transition-all">
            ค้นหา
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Calendar Widget
   ═══════════════════════════════════════════════════════════════ */

function CalendarWidget({ events }: { events: CalendarEvent[] }) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const todayDate = now.getDate();
  const todayStr = now.toISOString().split("T")[0];
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const eventsByDay = useMemo(() => {
    const map = new Map<number, CalendarEvent[]>();
    events.forEach((ev) => {
      const d = new Date(ev.date);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        const day = d.getDate();
        if (!map.has(day)) map.set(day, []);
        map.get(day)!.push(ev);
      }
    });
    return map;
  }, [events, currentYear, currentMonth]);

  const getEventsForDay = (day: number) => {
    const direct = eventsByDay.get(day) || [];
    const spanning = events.filter((ev) => {
      if (!ev.endDate) return false;
      const start = new Date(ev.date); const end = new Date(ev.endDate);
      if (start.getFullYear() !== currentYear || start.getMonth() !== currentMonth) return false;
      return day >= start.getDate() && day <= end.getDate();
    });
    return [...direct, ...spanning.filter((s) => !direct.some((d) => d.id === s.id))];
  };

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const dayHeaders = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

  const displayEvents = useMemo(() => {
    let list = events.filter((ev) => {
      const d = new Date(ev.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    }).sort((a, b) => a.date.localeCompare(b.date));
    if (selectedDay !== null) {
      const selectedEvents = getEventsForDay(selectedDay);
      const ids = new Set(selectedEvents.map((e) => e.id));
      list = list.filter((e) => ids.has(e.id));
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, currentYear, currentMonth, selectedDay]);

  const monthName = THAI_MONTHS[currentMonth];
  const yearThai = currentYear + 543;
  const catColorMap = useMemo(() => Object.fromEntries(Object.entries(eventCategoryMap).map(([k, v]) => [k, v.hex])), []);

  return (
    <div className="bg-white border border-[#D1D5DB]">
      <div className="p-5 pb-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-[#A31D1D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-sm font-semibold text-[#1A1A2E]">ปฏิทินกิจกรรม</h3>
          <span className="text-[10px] text-[#9CA3AF]">M365 Calendar</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <h4 className="text-base font-bold text-[#8B1515]">{monthName} {yearThai}</h4>
          {selectedDay && (
            <button onClick={() => setSelectedDay(null)} className="text-[10px] text-[#A31D1D] hover:underline font-medium flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              แสดงทั้งหมด
            </button>
          )}
        </div>
      </div>

      <div className="px-3 pb-3">
        <table className="w-full text-center border-collapse">
          <thead><tr>{dayHeaders.map((dh) => <th key={dh} className="text-[11px] font-medium text-[#6B7280] py-2">{dh}</th>)}</tr></thead>
          <tbody>
            {Array.from({ length: Math.ceil((firstDay + daysInMonth) / 7) }).map((_, weekIdx) => (
              <tr key={weekIdx}>
                {Array.from({ length: 7 }).map((_, dayIdx) => {
                  const dayNum = weekIdx * 7 + dayIdx - firstDay + 1;
                  const isValid = dayNum >= 1 && dayNum <= daysInMonth;
                  const isToday = isValid && dayNum === todayDate;
                  const isSelected = isValid && dayNum === selectedDay;
                  const dayEvents = isValid ? getEventsForDay(dayNum) : [];
                  return (
                    <td key={dayIdx} className="py-1 align-top">
                      {isValid && (
                        <button onClick={() => setSelectedDay(selectedDay === dayNum ? null : dayNum)} className="w-full group min-h-[44px] flex flex-col items-center justify-start">
                          <div className={`w-9 h-9 mx-auto flex items-center justify-center text-xs font-medium rounded-full transition-colors ${isToday ? "bg-[#8B1515] text-white font-bold shadow-sm" : isSelected ? "bg-[#FDB813] text-[#1A1A2E] font-bold ring-2 ring-[#FDB813]/50" : dayEvents.length > 0 ? "text-[#1A1A2E] group-hover:bg-[#FDB813]/10" : "text-[#9CA3AF] group-hover:bg-gray-50"}`}>
                            {dayNum}
                          </div>
                          {dayEvents.length > 0 && (
                            <div className="flex justify-center gap-[3px] mt-1 flex-wrap max-w-[60px]">
                              {(() => { const seen = new Set<string>(); return dayEvents.filter((ev) => { if (seen.has(ev.category)) return false; seen.add(ev.category); return true; }); })().map((ev) => (
                                <span key={ev.category} className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: catColorMap[ev.category] || "#9ca3af" }} />
                              ))}
                              {dayEvents.length > 3 && <span className="text-[9px] text-[#9CA3AF] leading-none">+{dayEvents.length - 3}</span>}
                            </div>
                          )}
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-5 pb-3 flex flex-wrap gap-2">
        {Object.entries(eventCategoryMap).map(([key, cat]) => <span key={key} className="text-[10px] px-1.5 py-0.5 font-medium flex items-center gap-1" style={{ color: cat.hex }}><span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.hex }} />{cat.label}</span>)}
      </div>

      <div className="border-t border-[#D1D5DB] p-5">
        <h4 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">
          {selectedDay ? `กิจกรรมวันที่ ${selectedDay} ${monthName} ${yearThai} (${displayEvents.length})` : `กิจกรรมเดือนนี้ (${displayEvents.length})`}
        </h4>
        {displayEvents.length === 0 ? (
          <p className="text-xs text-[#9CA3AF] text-center py-4">{selectedDay ? "ไม่มีกิจกรรมในวันที่เลือก" : "ไม่มีกิจกรรมในเดือนนี้"}</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {displayEvents.map((ev) => {
              const cat = eventCategoryMap[ev.category];
              const isToday = ev.date === todayStr; const isPast = ev.date < todayStr;
              return (
                <div key={ev.id} className={`flex gap-3 p-2 border-l-2 transition-colors ${isToday ? "border-l-[#FDB813] bg-[#FDB813]/5" : isPast ? "border-l-[#D1D5DB] opacity-60" : "border-l-transparent hover:bg-gray-50"}`}>
                  <div className="text-center shrink-0 w-8">
                    <p className="text-sm font-bold text-[#1A1A2E] leading-tight">{new Date(ev.date).getDate()}</p>
                    <p className="text-[9px] text-[#9CA3AF]">{THAI_MONTHS[currentMonth]}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#1A1A2E] leading-snug">{ev.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {ev.endDate ? <span className="text-[10px] text-[#6B7280]">{formatThaiDate(ev.date)} - {formatThaiDate(ev.endDate)}</span>
                        : ev.time && ev.endTime ? <span className="text-[10px] text-[#6B7280]">{ev.time} - {ev.endTime} น.</span>
                        : ev.time ? <span className="text-[10px] text-[#6B7280]">{ev.time} น.</span>
                        : <span className="text-[10px] text-[#6B7280]">ทั้งวัน</span>}
                      <span className="text-[10px] px-1.5 py-0.5 font-medium flex items-center gap-1" style={{ color: cat.hex }}><span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.hex }} />{cat.label}</span>
                      {isToday && <span className="text-[10px] text-[#FDB813] font-bold">วันนี้</span>}
                    </div>
                    {ev.location && <p className="text-[10px] text-[#9CA3AF] mt-0.5 truncate">{ev.location}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Global Search Results Dropdown
   ═══════════════════════════════════════════════════════════════ */

/** Group app categories into 5 business domains */
const categoryDomainMap: Record<string, string> = {
  erp: "erp", eoffice: "eoffice", storage: "storage",
  academic: "academic", hr: "hr",
};

/** Regulations / Announcements / Documents mapped to business domains */
const searchRegulations: { id: string; title: string; url: string; domain: string }[] = [
  { id: "reg-001", title: "ระเบียบการลงทะเบียนเรียน ระดับปริญญาตรี พ.ศ. 2565", url: "#", domain: "academic" },
  { id: "reg-002", title: "ระเบียบการสอบและการประเมินผลการศึกษา พ.ศ. 2563", url: "#", domain: "academic" },
  { id: "reg-003", title: "ระเบียบการฝึกงานทางกฎหมาย พ.ศ. 2564", url: "#", domain: "academic" },
  { id: "reg-004", title: "ระเบียบการรักษาสภาพนักศึกษาและการลาพักการศึกษา", url: "#", domain: "academic" },
  { id: "reg-005", title: "ระเบียบการขอรับทุนการศึกษาคณะนิติศาสตร์", url: "#", domain: "academic" },
];

const searchAnnouncements: { id: string; title: string; url: string; domain: string }[] = [
  { id: "ann-001", title: "ประกาศด่วน: การปรับปรุงระบบทะเบียนนักศึกษา — วันที่ 10 ก.ค. 2569", url: "#", domain: "eoffice" },
  { id: "ann-002", title: "ประชุมคณะกรรมการประจำคณะ ครั้งที่ 7/2569 — วันที่ 10 ก.ค. 2569", url: "#", domain: "eoffice" },
  { id: "ann-003", title: "หมดเขตส่งเกรดภาคเรียน 1/2569 — ภายในวันที่ 15 ก.ค. 2569", url: "#", domain: "eoffice" },
  { id: "ann-004", title: "รับสมัครทุนวิจัยคณะนิติศาสตร์ ประจำปี 2569", url: "#", domain: "eoffice" },
  { id: "ann-005", title: "อบรมเชิงปฏิบัติการ PDPA สำหรับบุคลากร — 28 ก.ค. 2569", url: "#", domain: "eoffice" },
];

const searchDocuments: { id: string; title: string; url: string; domain: string }[] = [
  { id: "doc-001", title: "คู่มือการใช้งานระบบทะเบียนนักศึกษา (PDF)", url: "#", domain: "academic" },
  { id: "doc-002", title: "แบบฟอร์มขออนุญาตจัดกิจกรรมนักศึกษา (DOCX)", url: "#", domain: "academic" },
  { id: "doc-003", title: "แผนการสอนรายวิชา LAW101 — ภาค 1/2569 (PDF)", url: "#", domain: "academic" },
  { id: "doc-004", title: "คู่มืออาจารย์ที่ปรึกษา ประจำปีการศึกษา 2569 (PDF)", url: "#", domain: "academic" },
  { id: "doc-005", title: "แบบฟอร์มขออนุมัติเดินทางไปราชการ (DOCX)", url: "#", domain: "erp" },
  { id: "doc-006", title: "รายงานสรุปผลการประเมินคุณภาพการศึกษา 2568 (PDF)", url: "#", domain: "academic" },
];

type SearchResultItem = { id: string; title: string; url: string; subtitle?: string; domain: string };

/** 5 business domains for global search grouping */
const searchDomains: { id: string; label: string; icon: string; color: string; dotColor: string }[] = [
  { id: "erp", label: "ERP", icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z", color: "text-purple-600", dotColor: "#a855f7" },
  { id: "eoffice", label: "E-Office", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", color: "text-blue-600", dotColor: "#3b82f6" },
  { id: "storage", label: "ระบบจัดเก็บ", icon: "M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z", color: "text-green-600", dotColor: "#22c55e" },
  { id: "academic", label: "ระบบงานวิชาการ", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", color: "text-orange-600", dotColor: "#f97316" },
  { id: "hr", label: "ระบบงานบุคคล", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z", color: "text-red-500", dotColor: "#ef4444" },
];

function GlobalSearchResults({ keyword, allApps, userRoles }: { keyword: string; allApps: Application[]; userRoles: string[] }) {
  const MAX_RESULTS = 10;

  const grouped = useMemo(() => {
    const q = keyword.toLowerCase();
    const groups: Record<string, SearchResultItem[]> = {};

    // Apps
    const apps = allApps.filter((a) => isAppAllowed(a, userRoles) && (a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)));
    for (const a of apps.slice(0, 6)) {
      const domain = categoryDomainMap[a.category] ?? "academic";
      if (!groups[domain]) groups[domain] = [];
      groups[domain].push({ id: a.id, title: a.name, subtitle: a.description, url: a.url, domain });
    }

    // Regulations
    for (const r of searchRegulations.filter((x) => x.title.toLowerCase().includes(q)).slice(0, 3)) {
      if (!groups[r.domain]) groups[r.domain] = [];
      groups[r.domain].push({ id: r.id, title: r.title, url: r.url, domain: r.domain });
    }

    // Announcements
    for (const a of searchAnnouncements.filter((x) => x.title.toLowerCase().includes(q)).slice(0, 3)) {
      if (!groups[a.domain]) groups[a.domain] = [];
      groups[a.domain].push({ id: a.id, title: a.title, url: a.url, domain: a.domain });
    }

    // Documents
    for (const d of searchDocuments.filter((x) => x.title.toLowerCase().includes(q)).slice(0, 3)) {
      if (!groups[d.domain]) groups[d.domain] = [];
      groups[d.domain].push({ id: d.id, title: d.title, url: d.url, domain: d.domain });
    }

    // Limit per group & total
    const ordered = searchDomains.filter((sd) => groups[sd.id]);
    let total = 0;
    const capped: Record<string, SearchResultItem[]> = {};
    for (const sd of ordered) {
      capped[sd.id] = groups[sd.id].slice(0, Math.min(groups[sd.id].length, MAX_RESULTS - total));
      total += capped[sd.id].length;
      if (total >= MAX_RESULTS) break;
    }
    return capped;
  }, [keyword, allApps, userRoles]);

  const hasResults = Object.values(grouped).some((g) => g.length > 0);
  if (!hasResults) return null;

  return (
    <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-[#FDB813] shadow-xl max-h-80 overflow-y-auto">
      {searchDomains.map((sd) => {
        const items = grouped[sd.id];
        if (!items || items.length === 0) return null;
        return (
          <div key={sd.id}>
            <div className="px-3 py-1.5 bg-gray-50 border-b border-[#D1D5DB]/50 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: sd.dotColor }} />
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${sd.color}`}>{sd.label}</span>
            </div>
            {items.map((item) => (
              <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
                className="flex items-start gap-3 px-3 py-2 hover:bg-[#FDB813]/5 transition-colors border-b border-[#D1D5DB]/50 last:border-b-0 cursor-pointer">
                <svg className={`w-4 h-4 shrink-0 mt-0.5 ${sd.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={sd.icon} />
                </svg>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[#1A1A2E] leading-snug line-clamp-1">{item.title}</p>
                  {item.subtitle && <p className="text-[10px] text-[#6B7280] mt-0.5 line-clamp-1">{item.subtitle}</p>}
                </div>
              </a>
            ))}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════════ */

export default function ApplicationHubPage() {
  const { data: session } = useSession();
  const userRoles: string[] = useMemo(() => (session?.user as Record<string, unknown>)?.roles as string[] ?? [], [session?.user]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [pinnedIds, setPinnedIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set(["eoffice", "academic"]);
    try { const stored = localStorage.getItem("app-hub-pins"); if (stored) return new Set(JSON.parse(stored)); } catch {}
    return new Set(["eoffice", "academic"]);
  });
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState<{ keyword: string; dateFrom: string; dateTo: string; categories: string[] } | null>(null);
  const [loginGateApp, setLoginGateApp] = useState<Application | null>(null);

  // Read from localStorage (written by admin page)
  const [customApps] = useState<Application[]>(() => {
    if (typeof window === "undefined") return [];
    try { const stored = localStorage.getItem("app-hub-custom-apps"); if (stored) return JSON.parse(stored); } catch {}
    return [];
  });
  const [appStatusOverrides] = useState<Record<string, AppStatus>>(() => {
    if (typeof window === "undefined") return {};
    try { const stored = localStorage.getItem("app-hub-status-overrides"); if (stored) return JSON.parse(stored); } catch {}
    return {};
  });
  const [customCalendarEvents] = useState<CalendarEvent[]>(() => {
    if (typeof window === "undefined") return [];
    try { const stored = localStorage.getItem("app-hub-custom-events"); if (stored) return JSON.parse(stored); } catch {}
    return [];
  });

  const allApps = useMemo(() => {
    type AppWithDeleted = Application & { deleted?: boolean };
    const deletedIds = new Set(customApps.filter((a) => (a as AppWithDeleted).deleted).map((a) => a.id));
    const merged = [...applications.filter((a) => !deletedIds.has(a.id)), ...customApps.filter((a) => !(a as AppWithDeleted).deleted)];
    return merged.map((a) => ({
      ...a, status: appStatusOverrides[a.id] ?? a.status,
    }));
  }, [customApps, appStatusOverrides]);

  const allCalendarEvents = useMemo(() => {
    type CalWithDeleted = CalendarEvent & { deleted?: boolean };
    const deletedIds = new Set(customCalendarEvents.filter((e) => (e as CalWithDeleted).deleted).map((e) => e.id));
    const overridden = new Set(customCalendarEvents.filter((e) => !(e as CalWithDeleted).deleted).map((e) => e.id));
    const base = calendarEvents.filter((e) => !deletedIds.has(e.id) && !overridden.has(e.id));
    const custom = customCalendarEvents.filter((e) => !(e as CalWithDeleted).deleted);
    return [...base, ...custom];
  }, [customCalendarEvents]);

  useEffect(() => { localStorage.setItem("app-hub-pins", JSON.stringify([...pinnedIds])); }, [pinnedIds]);

  const togglePin = (id: string) => {
    setPinnedIds((prev) => { const next = new Set(prev); if (next.has(id)) { next.delete(id); } else { next.add(id); } return next; });
  };

  const handleOpenApp = (app: Application) => setLoginGateApp(app);

  // Filter and separate pinned/unpinned
  const { pinnedApps, unpinnedApps } = useMemo(() => {
    let list = [...allApps].filter((a) => isAppAllowed(a, userRoles));

    // Category
    if (activeCategory) list = list.filter((a) => a.category === activeCategory);

    // Quick search
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter((a) => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
    }

    // Advanced search
    if (advancedFilters) {
      const { keyword, categories } = advancedFilters;
      if (keyword.trim()) {
        const q = keyword.toLowerCase();
        list = list.filter((a) => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.subApps.some((s) => s.name.toLowerCase().includes(q)));
      }
      if (categories.length > 0) {
        list = list.filter((a) => categories.includes(a.category));
      }
    }

    // Separate
    const pinned = list.filter((a) => pinnedIds.has(a.id));
    const unpinned = list.filter((a) => !pinnedIds.has(a.id));

    return { pinnedApps: pinned, unpinnedApps: unpinned };
  }, [allApps, activeCategory, searchText, advancedFilters, pinnedIds, userRoles]);

  const totalApps = pinnedApps.length + unpinnedApps.length;

  return (
    <div className="pt-0 px-6 pb-8">
      <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">Application Hub</h1>
      <p className="text-sm text-[#6B7280] mb-6">ศูนย์กลางแอปพลิเคชัน</p>

      {/* ═══ Content + Calendar ═══ */}
      <div className="flex gap-6 items-start" suppressHydrationWarning>
        <div className="flex-1 min-w-0">
        {/* ─── Toolbar: Search + Advanced + Tabs + View Toggle ─── */}
        <div className="flex flex-col gap-1">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="ค้นหาแอปพลิเคชัน ระเบียบ ประกาศ และเอกสาร..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-[#D1D5DB] bg-white placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30" />
            {/* Global Search Dropdown */}
            {searchText.trim() && (
              <div suppressHydrationWarning>
                <GlobalSearchResults keyword={searchText} allApps={allApps} userRoles={userRoles} />
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span />
            <div className="flex items-center gap-2">
              <button onClick={() => setShowAdvancedSearch(true)}
                className="text-[11px] font-medium text-[#A31D1D] hover:text-[#8B1515] transition-colors">
                ค้นหาขั้นสูง
              </button>
              {advancedFilters && (
                <button onClick={() => setAdvancedFilters(null)}
                  className="text-[11px] font-medium text-[#A31D1D] hover:text-[#8B1515] transition-colors">ล้างตัวกรอง</button>
              )}
            </div>
          </div>
        </div>

        {/* Category Tabs + View Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
          <div className="flex flex-wrap gap-2">
          <button onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${activeCategory === null ? "bg-[#8B1515] text-white border-[#8B1515]" : "bg-white text-[#6B7280] border-[#D1D5DB] hover:border-[#FDB813] hover:text-[#1A1A2E]"}`}>
            ทั้งหมด
          </button>
          {appCategories.map((cat) => (
            <button key={cat.id} onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${activeCategory === cat.id ? "bg-[#8B1515] text-white border-[#8B1515]" : "bg-white text-[#6B7280] border-[#D1D5DB] hover:border-[#FDB813] hover:text-[#1A1A2E]"}`}>
              {cat.name}
            </button>
          ))}
          </div>
          {/* Grid / List Toggle */}
          <div className="flex border border-[#D1D5DB] rounded overflow-hidden">
            <button onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === "grid" ? "bg-[#8B1515] text-white" : "bg-white text-[#6B7280] hover:bg-[#F5F5F5]"}`}
              title="Grid View">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </button>
            <button onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === "list" ? "bg-[#8B1515] text-white" : "bg-white text-[#6B7280] hover:bg-[#F5F5F5]"}`}
              title="List View">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            </button>
          </div>
        </div>

        {/* ─── Important Announcements ─── */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-1.5">
            <svg className="w-4 h-4 text-[#FDB813]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            <h3 className="text-base font-bold text-[#1A1A2E]">ประกาศสำคัญ</h3>
          </div>
          <div className="bg-gradient-to-r from-[#8B1515] to-[#A31D1D] border-l-4 border-[#FDB813] p-3">
            <div className="space-y-1">
              <a href="#" className="block text-sm text-white hover:text-[#FDB813] font-medium leading-snug transition-colors">
                ⚡ ประกาศด่วน: การปรับปรุงระบบทะเบียนนักศึกษา — วันที่ 10 ก.ค. 2569 เวลา 22:00-06:00 น.
              </a>
              <a href="#" className="block text-xs text-white/70 hover:text-white leading-snug transition-colors">
                📌 ประชุมคณะกรรมการประจำคณะ ครั้งที่ 7/2569 — วันที่ 10 ก.ค. 2569 เวลา 13:30 น.
              </a>
              <a href="#" className="block text-xs text-white/70 hover:text-white leading-snug transition-colors">
                📋 หมดเขตส่งเกรดภาคเรียนที่ 1/2569 — ภายในวันที่ 15 ก.ค. 2569
              </a>
            </div>
          </div>
        </div>

        {/* ─── Pinned Section ─── */}
        {pinnedApps.length > 0 && (
          <div className="mt-5" suppressHydrationWarning>
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-[#FDB813]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">ปักหมุด ({pinnedApps.length})</span>
            </div>
            <div className={viewMode === "list" ? "space-y-2" : "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4"}>
              {pinnedApps.map((app) => (
                viewMode === "list" ? <AppListItem key={app.id} app={app} pinned={true} onTogglePin={togglePin} onClick={handleOpenApp} /> : <AppIcon key={app.id} app={app} pinned={true} onTogglePin={togglePin} onClick={handleOpenApp} />
              ))}
            </div>
          </div>
        )}

        {/* ─── All Apps ─── */}
        <div className="mt-5" suppressHydrationWarning>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide" suppressHydrationWarning>แอปพลิเคชันทั้งหมด ({unpinnedApps.length})</span>
          </div>

          {unpinnedApps.length === 0 ? (
            <div className="text-center py-16 text-[#9CA3AF]">
              <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-sm">ไม่พบแอปพลิเคชันที่ค้นหา</p>
              {totalApps > 0 && <p className="text-xs mt-1">แต่มี {pinnedApps.length} รายการที่ปักหมุดอยู่</p>}
            </div>
          ) : (
            <div className={viewMode === "list" ? "space-y-2" : "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4"}>
              {unpinnedApps.map((app) => (
                viewMode === "list" ? <AppListItem key={app.id} app={app} pinned={false} onTogglePin={togglePin} onClick={handleOpenApp} /> : <AppIcon key={app.id} app={app} pinned={false} onTogglePin={togglePin} onClick={handleOpenApp} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══ RIGHT: Calendar ═══ */}
      <div className="w-80 shrink-0"><CalendarWidget events={allCalendarEvents} /></div>
    </div>

      {/* ─── Modals ─── */}
      {loginGateApp && <LoginGate app={loginGateApp} onClose={() => setLoginGateApp(null)} />}
      {showAdvancedSearch && (
        <AdvancedSearchModal
          onApply={(filters) => setAdvancedFilters(filters)}
          onClose={() => setShowAdvancedSearch(false)}
        />
      )}
    </div>
  );
}
