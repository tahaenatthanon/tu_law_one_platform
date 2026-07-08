"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Megaphone } from "lucide-react";

/* ─── Types ─── */
type Announcement = {
  id: string; title: string; content?: string; status: string;
  publishDate?: string; expireDate?: string;
  category: { id: number; name: string };
  department?: { id: number; name: string } | null;
};
type OrgStatItem = { id?: number; statKey: string; statValue: number; labelTh: string; icon?: string };
type ContactItem = { id: number; name: string; telephone?: string; contactEmail?: string; location?: string };
type Subscription = { id: number; categoryId?: number; departmentId?: number; isSubscribed: boolean; category?: { id: number; name: string }; department?: { id: number; name: string } };
type CalendarEventItem = {
  id: string; title: string; date: string; endDate?: string; time?: string; endTime?: string;
  location?: string; category: "meeting" | "seminar" | "exam" | "holiday" | "deadline"; description?: string;
};

/* ─── Constants ─── */
const ANN_TYPES = [
  { key: "urgent", name: "ด่วน", icon: "⚡", color: "#DC2626", bg: "#FEE2E2", border: "#FCA5A5" },
  { key: "invitation", name: "เชิญชวน", icon: "📨", color: "#059669", bg: "#D1FAE5", border: "#6EE7B7" },
  { key: "result", name: "ประกาศผล", icon: "🏆", color: "#4A90D9", bg: "#DBEAFE", border: "#93C5FD" },
  { key: "policy", name: "นโยบาย", icon: "📜", color: "#E5A800", bg: "#FEF3C7", border: "#FCD34D" },
];
const CAL_CATEGORIES = [
  { key: "meeting", label: "ประชุม", color: "#8B1515" },
  { key: "seminar", label: "สัมมนา", color: "#4A90D9" },
  { key: "exam", label: "สอบ", color: "#EA580C" },
  { key: "holiday", label: "วันหยุด", color: "#059669" },
  { key: "deadline", label: "กำหนดส่ง", color: "#FDB813" },
];
const TM = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const DAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const FMT = (n: number) => n.toLocaleString("th-TH");

/* ─── Mock Data ─── */
const MOCK_EVENTS: CalendarEventItem[] = [
  { id: "c1", title: "ประชุมคณะกรรมการประจำคณะ ครั้งที่ 7/2569", date: "2026-07-10", time: "13:30", endTime: "16:30", category: "meeting", location: "ห้องประชุมชั้น 5" },
  { id: "c2", title: "สัมมนาวิชาการกฎหมายทรัพย์สินทางปัญญา", date: "2026-07-15", time: "09:00", endTime: "16:00", category: "seminar", location: "ห้อง LT-1" },
  { id: "c3", title: "สอบปลายภาค ภาค 1/2569 (วันแรก)", date: "2026-07-20", endDate: "2026-07-31", category: "exam" },
  { id: "c4", title: "วันอาสาฬหบูชา", date: "2026-07-12", category: "holiday" },
  { id: "c5", title: "หมดเขตส่งผลการประเมินการปฏิบัติงาน", date: "2026-07-25", category: "deadline" },
  { id: "c6", title: "ประชุมสภามหาวิทยาลัย", date: "2026-07-18", time: "09:00", endTime: "12:00", category: "meeting", location: "ห้องประชุมสภา" },
  { id: "c7", title: "วันเข้าพรรษา", date: "2026-07-13", category: "holiday" },
];
const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: "a1", title: "ด่วนที่สุด: เปลี่ยนแปลงวันสอบวิชา น.101", content: "เนื่องจากมีเหตุจำเป็นต้องเปลี่ยนแปลงตารางสอบ...", status: "published", publishDate: "2026-07-08", category: { id: 1, name: "urgent" } },
  { id: "a2", title: "ขอเชิญร่วมบริจาคโลหิต ครั้งที่ 2/2569", content: "วันที่ 20 กรกฎาคม 2569 ณ ห้องประชุมชั้น 1...", status: "published", publishDate: "2026-07-05", category: { id: 2, name: "invitation" } },
  { id: "a3", title: "ประกาศผลการคัดเลือกทุนเรียนดี ปีการศึกษา 2569", content: "รายชื่อผู้ผ่านการคัดเลือกทุนเรียนดีประจำปี...", status: "published", publishDate: "2026-07-03", category: { id: 3, name: "result" } },
  { id: "a4", title: "นโยบายการจัดการเรียนการสอนแบบ Hybrid", content: "ตามมติคณะกรรมการประจำคณะ ครั้งที่ 5/2569...", status: "published", publishDate: "2026-07-01", category: { id: 4, name: "policy" } },
  { id: "a5", title: "ด่วน: แจ้งเปลี่ยนแปลงตารางสอบ", content: "ติดตามได้ที่เว็บไซต์คณะ...", status: "published", publishDate: "2026-07-06", category: { id: 1, name: "urgent" } },
  { id: "a6", title: "ขอเชิญเข้าร่วมอบรมกฎหมาย PDPA", content: "อบรมฟรีไม่มีค่าใช้จ่าย...", status: "published", publishDate: "2026-07-04", category: { id: 2, name: "invitation" } },
  { id: "a7", title: "ประกาศผลสอบคัดเลือกบุคคลเข้าศึกษา ระดับปริญญาโท", content: "รายชื่อผู้ผ่านการสอบคัดเลือก...", status: "published", publishDate: "2026-07-02", category: { id: 3, name: "result" } },
  { id: "a8", title: "นโยบายความเป็นส่วนตัว (Privacy Policy) ฉบับปรับปรุง", content: "มีผลบังคับใช้ตั้งแต่วันที่ 1 สิงหาคม 2569...", status: "published", publishDate: "2026-06-28", category: { id: 4, name: "policy" } },
];

/* ─── Monthly Calendar ─── */
function MonthlyCalendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = TM[month];
  const yearThai = year + 543;
  const today = now.getDate();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  const eventsByDay = useMemo(() => {
    const map = new Map<number, CalendarEventItem[]>();
    MOCK_EVENTS.forEach(ev => {
      const d = new Date(ev.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map.has(day)) map.set(day, []);
        map.get(day)!.push(ev);
      }
      if (ev.endDate) {
        const start = new Date(ev.date);
        const end = new Date(ev.endDate);
        for (let cd = new Date(start); cd <= end; cd.setDate(cd.getDate() + 1)) {
          if (cd.getFullYear() === year && cd.getMonth() === month) {
            const day = cd.getDate();
            if (day < start.getDate()) continue;
            if (!map.has(day)) map.set(day, []);
            if (!map.get(day)!.some(e => e.id === ev.id)) map.get(day)!.push(ev);
          }
        }
      }
    });
    return map;
  }, [year, month]);

  const calEventsThisMonth = useMemo(() =>
    MOCK_EVENTS.filter(ev => {
      const d = new Date(ev.date);
      if (ev.endDate) {
        const end = new Date(ev.endDate);
        return (d.getFullYear() === year && d.getMonth() === month) || (end.getFullYear() === year && end.getMonth() === month);
      }
      return d.getFullYear() === year && d.getMonth() === month;
    }).sort((a, b) => a.date.localeCompare(b.date)),
  [year, month]);

  const weeks = Math.ceil((firstDay + daysInMonth) / 7);

  return (
    <div className="bg-white border border-[#D1D5DB]">
      <div className="p-4 border-b border-[#D1D5DB] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }}
            className="w-7 h-7 flex items-center justify-center border border-[#D1D5DB] hover:bg-[#F5F5F5] text-sm cursor-pointer">&lt;</button>
          <h3 className="text-base font-bold text-[#8B1515]">{monthName} {yearThai}</h3>
          <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }}
            className="w-7 h-7 flex items-center justify-center border border-[#D1D5DB] hover:bg-[#F5F5F5] text-sm cursor-pointer">&gt;</button>
        </div>
        <button onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth()); }}
          className="text-[11px] font-medium text-[#A31D1D] hover:underline cursor-pointer">วันนี้</button>
      </div>
      <div className="p-3">
        <table className="w-full text-center border-collapse">
          <thead><tr>{DAYS.map(d => <th key={d} className="text-[11px] font-medium text-[#6B7280] py-1.5">{d}</th>)}</tr></thead>
          <tbody>
            {Array.from({ length: weeks }).map((_, wi) => (
              <tr key={wi}>
                {Array.from({ length: 7 }).map((_, di) => {
                  const dayNum = wi * 7 + di - firstDay + 1;
                  const isValid = dayNum >= 1 && dayNum <= daysInMonth;
                  const isToday = isValid && isCurrentMonth && dayNum === today;
                  const dayEvents = isValid ? eventsByDay.get(dayNum) || [] : [];
                  return (
                    <td key={di} className="p-0.5 align-top">
                      {isValid && (
                        <div className={`min-h-[46px] flex flex-col items-center py-1 ${isToday ? "bg-[#FDB813]/20" : ""}`}>
                          <span className={`w-7 h-7 flex items-center justify-center text-xs font-medium rounded-full ${isToday ? "bg-[#8B1515] text-white" : dayEvents.length > 0 ? "text-[#1A1A2E]" : "text-[#9CA3AF]"}`}>{dayNum}</span>
                          {dayEvents.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-[2px] mt-0.5 max-w-[50px]">
                              {(() => { const seen = new Set<string>(); return dayEvents.filter(ev => { if (seen.has(ev.category)) return false; seen.add(ev.category); return true; }); })()
                                .map(ev => {
                                  const cat = CAL_CATEGORIES.find(c => c.key === ev.category);
                                  return <span key={ev.category} className="block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat?.color || "#9CA3AF" }} title={cat?.label} />;
                                })}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 pb-3 flex flex-wrap gap-3">
        {CAL_CATEGORIES.map(c => (
          <div key={c.key} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
            <span className="text-[10px] text-[#6B7280]">{c.label}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-[#D1D5DB] p-4">
        <h4 className="text-xs font-semibold text-[#6B7280] uppercase mb-2">กิจกรรมเดือนนี้ ({calEventsThisMonth.length})</h4>
        <div className="space-y-2 max-h-52 overflow-y-auto">
          {calEventsThisMonth.map(ev => {
            const cat = CAL_CATEGORIES.find(c => c.key === ev.category);
            const d = new Date(ev.date);
            return (
              <div key={ev.id} className="flex gap-3 p-2 border-l-2 hover:bg-gray-50 transition-colors" style={{ borderLeftColor: cat?.color || "#D1D5DB" }}>
                <div className="text-center shrink-0 w-9">
                  <p className="text-sm font-bold text-[#1A1A2E] leading-tight">{d.getDate()}</p>
                  <p className="text-[9px] text-[#9CA3AF]">{TM[d.getMonth()]}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#1A1A2E]">{ev.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {ev.time && <span className="text-[10px] text-[#6B7280]">{ev.time}{ev.endTime ? ` - ${ev.endTime} น.` : " น."}</span>}
                    {ev.location && <span className="text-[10px] text-[#9CA3AF]">📍 {ev.location}</span>}
                    <span className="text-[10px] font-medium" style={{ color: cat?.color }}>{cat?.label}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Intranet Page ─── */
export default function IntranetPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [announcements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);
  const [stats, setStats] = useState<OrgStatItem[]>([]);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingContacts, setLoadingContacts] = useState(true);

  useEffect(() => {
    fetch("/api/intranet/stats").then(r => r.json()).then(j => { if (j.success) setStats(j.data); setLoadingStats(false); }).catch(() => setLoadingStats(false));
    fetch("/api/intranet/contacts").then(r => r.json()).then(j => { if (j.success) setContacts(j.data); setLoadingContacts(false); }).catch(() => setLoadingContacts(false));
    if (session?.user) {
      fetch("/api/intranet/subscriptions").then(r => r.json()).then(j => { if (j.success) setSubscriptions(j.data); }).catch(() => {});
    }
  }, [session]);

  const filtered = activeTab === "all" ? announcements : announcements.filter(a => a.category.name === activeTab);

  const isSubscribed = useCallback((categoryKey: string) => {
    return subscriptions.some(s => s.isSubscribed && s.category?.name === categoryKey);
  }, [subscriptions]);

  const toggleSubscribe = useCallback(async (categoryKey: string) => {
    const idx = ANN_TYPES.findIndex(t => t.key === categoryKey);
    const existingSub = subscriptions.find(s => s.isSubscribed && s.category?.name === categoryKey);
    if (existingSub) {
      await fetch("/api/intranet/subscriptions", { method: "DELETE", body: JSON.stringify({ categoryId: idx + 1 }), headers: { "Content-Type": "application/json" } });
      setSubscriptions(prev => prev.map(s => s.id === existingSub.id ? { ...s, isSubscribed: false } : s));
    } else {
      const res = await fetch("/api/intranet/subscriptions", { method: "POST", body: JSON.stringify({ categoryId: idx + 1 }), headers: { "Content-Type": "application/json" } });
      if (res.ok) {
        const data = await res.json();
        if (data.success) setSubscriptions(prev => [...prev, data.data]);
      }
    }
  }, [subscriptions]);

  return (
    <div className="pt-0 px-6 pb-8">
      <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">อินทราเน็ตคณะ</h1>
      <p className="text-sm text-[#6B7280] mb-6">Intranet — ข่าวสาร ปฏิทิน และข้อมูลภายในคณะ</p>

      <div className="flex gap-6 items-start">
        {/* Left Column */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* ─── Announcements ─── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#1A1A2E]">📢 ประกาศและข่าวสาร</h3>
            </div>
            {/* Tabs */}
            <div className="flex gap-1 bg-[#F5F5F5] p-1 rounded w-fit flex-wrap">
              <button onClick={() => setActiveTab("all")}
                className={`px-3 py-2 text-sm font-medium rounded cursor-pointer transition-colors ${activeTab === "all" ? "bg-[#FDB813] text-[#1A1A2E]" : "text-[#6B7280] hover:text-[#1A1A2E]"}`}>
                📋 ทั้งหมด
              </button>
              {ANN_TYPES.map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`px-3 py-2 text-sm font-medium rounded cursor-pointer transition-colors ${activeTab === t.key ? "text-white" : "text-[#6B7280] hover:text-[#1A1A2E]"}`}
                  style={activeTab === t.key ? { backgroundColor: t.color } : {}}>
                  {t.icon} {t.name}
                </button>
              ))}
            </div>
            {/* Subscribe */}
            <div className="mt-2 flex flex-wrap gap-2">
              {ANN_TYPES.map(t => {
                const subbed = isSubscribed(t.key);
                return (
                  <button key={`sub-${t.key}`} onClick={() => toggleSubscribe(t.key)}
                    className={`text-[11px] px-2 py-1 border rounded flex items-center gap-1 cursor-pointer transition-colors ${subbed ? "bg-[#FDB813]/10 border-[#FDB813] text-[#1A1A2E]" : "bg-white border-[#D1D5DB] text-[#9CA3AF] hover:border-[#FDB813]"}`}>
                    {subbed ? "🔔" : "🔕"} {subbed ? "กำลังติดตาม" : "ติดตาม"} {t.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Announcements List */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-[#9CA3AF]">
              <Megaphone className="w-10 h-10 mx-auto mb-2 text-[#9CA3AF]" strokeWidth={1.5} />
                <p className="text-sm">ไม่มีประกาศในหมวดนี้</p>
              </div>
            ) : filtered.map(a => {
              const t = ANN_TYPES.find(tp => tp.key === a.category.name) || ANN_TYPES[0];
              return (
                <div key={a.id} className="bg-white border border-[#D1D5DB] hover:border-[#FDB813] transition-colors" style={{ borderLeftWidth: "4px", borderLeftColor: t.color }}>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] px-1.5 py-0.5 font-medium text-white" style={{ backgroundColor: t.color }}>{t.icon} {t.name}</span>
                      {a.publishDate && <span className="text-[10px] text-[#9CA3AF]">{new Date(a.publishDate).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}</span>}
                      {a.expireDate && <span className="text-[10px] text-red-400">⏰ หมดเขต {new Date(a.expireDate).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}</span>}
                      {a.department && <span className="text-[10px] text-[#6B7280]">🏛️ {a.department.name}</span>}
                    </div>
                    <h4 className="font-semibold text-[#1A1A2E] text-sm">{a.title}</h4>
                    {a.content && <p className="text-xs text-[#6B7280] mt-1 line-clamp-2">{a.content}</p>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ─── Department Contacts ─── */}
          <div>
            <h3 className="text-sm font-bold text-[#1A1A2E] mb-3">📞 ข้อมูลติดต่อหน่วยงานภายใน</h3>
            <div className="bg-white border border-[#D1D5DB] overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F5F5F5] text-left">
                    <th className="py-2 px-3 font-medium text-[#1A1A2E] text-xs">หน่วยงาน</th>
                    <th className="py-2 px-3 font-medium text-[#1A1A2E] text-xs">เบอร์โทรศัพท์</th>
                    <th className="py-2 px-3 font-medium text-[#1A1A2E] text-xs">อีเมล</th>
                    <th className="py-2 px-3 font-medium text-[#1A1A2E] text-xs">สถานที่ตั้ง</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingContacts ? (
                    <tr><td colSpan={4} className="py-8 text-center text-[#9CA3AF] text-xs">กำลังโหลด...</td></tr>
                  ) : contacts.length === 0 ? (
                    <tr><td colSpan={4} className="py-8 text-center text-[#9CA3AF] text-xs">ไม่มีข้อมูลหน่วยงาน</td></tr>
                  ) : contacts.map(c => (
                    <tr key={c.id} className="border-b border-[#F5F5F5] hover:bg-[#FEF9E7]">
                      <td className="py-2 px-3 text-[#1A1A2E] font-medium text-xs">{c.name}</td>
                      <td className="py-2 px-3 text-[#6B7280] text-xs">{c.telephone || "-"}</td>
                      <td className="py-2 px-3 text-[#4A90D9] text-xs">{c.contactEmail ? <a href={`mailto:${c.contactEmail}`} className="hover:underline">{c.contactEmail}</a> : "-"}</td>
                      <td className="py-2 px-3 text-[#6B7280] text-xs">{c.location || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-80 shrink-0 space-y-5">
          {/* Stats */}
          <div className="bg-white border border-[#D1D5DB] p-4">
            <h3 className="text-sm font-bold text-[#1A1A2E] mb-3">📊 สถิติองค์กร</h3>
            {loadingStats ? (
              <p className="text-xs text-[#9CA3AF]">กำลังโหลด...</p>
            ) : (
              <div className="space-y-3">
                {stats.map(s => (
                  <div key={s.statKey} className="flex items-center gap-3 p-2 hover:bg-[#F5F5F5] transition-colors">
                    <div className="w-10 h-10 flex items-center justify-center text-lg bg-[#FDB813]/10">
                      {s.icon || "📌"}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-[#1A1A2E] leading-tight">{FMT(s.statValue)}</p>
                      <p className="text-[10px] text-[#6B7280]">{s.labelTh}</p>
                    </div>
                  </div>
                ))}
                <p className="text-[9px] text-[#9CA3AF] text-right mt-1">⏱ อัปเดตล่าสุด: {new Date().toLocaleTimeString("th-TH")}</p>
              </div>
            )}
          </div>

          {/* Calendar */}
          <MonthlyCalendar />
        </div>
      </div>
    </div>
  );
}
