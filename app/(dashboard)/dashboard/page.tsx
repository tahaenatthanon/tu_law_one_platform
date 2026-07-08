"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useAppHub } from "@/lib/app-hub-context";
import { type CalendarEvent, appCategories } from "@/lib/app-data";
import { Search, Calendar, X, Filter, Megaphone } from "lucide-react";

const FMT = (n: number) => n.toLocaleString("th-TH");
const TM = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

const DEPT = {
  it: { n: "ฝ่าย IT", s: 8, p: 5, bu: 32, bt: 50 },
  academic: { n: "ฝ่ายวิชาการ", s: 25, p: 12, bu: 85, bt: 120 },
  support: { n: "ฝ่ายสนับสนุน", s: 15, p: 7, bu: 41, bt: 60 },
};
const AS = 48, AP = 24, ABU = 158, ABT = 230;
const WK = [
  { d: "จ.", on: 7, off: 0, mt: 0 }, { d: "อ.", on: 6, off: 1, mt: 0 },
  { d: "พ.", on: 7, off: 0, mt: 0 }, { d: "พฤ.", on: 5, off: 1, mt: 1 },
  { d: "ศ.", on: 6, off: 0, mt: 1 }, { d: "ส.", on: 4, off: 2, mt: 1 },
  { d: "อา.", on: 3, off: 3, mt: 1 },
];
const TRM = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค."];
const TD = { users: [280, 285, 290, 295, 298, 300, 305], proj: [15, 18, 20, 22, 21, 23, 24], budg: [60, 55, 65, 58, 70, 62, 68] };
const ANNS = [
  { id: "a1", t: "ประกาศด่วน: การปรับปรุงระบบทะเบียนนักศึกษา — วันที่ 10 ก.ค. 2569", ty: "urgent" },
  { id: "a2", t: "ประชุมคณะกรรมการประจำคณะ ครั้งที่ 7/2569 — วันที่ 10 ก.ค. 2569 เวลา 13:30 น.", ty: "meeting" },
  { id: "a3", t: "หมดเขตส่งเกรดภาคเรียนที่ 1/2569 — ภายในวันที่ 15 ก.ค. 2569", ty: "deadline" },
  { id: "a4", t: "รับสมัครทุนวิจัยคณะนิติศาสตร์ ประจำปี 2569", ty: "general" },
];

/* ═══════════════════════════════════════════════════════════════
   Per-department trend data
   ═══════════════════════════════════════════════════════════════ */

const DEPT_TREND: Record<string, { users: number[]; proj: number[]; budg: number[] }> = {
  it: { users: [12, 13, 12, 11, 10, 9, 8], proj: [3, 4, 4, 5, 5, 5, 5], budg: [4.0, 5.0, 4.0, 3.0, 3.0, 3.0, 3.2] },
  academic: { users: [22, 23, 24, 24, 25, 25, 25], proj: [8, 9, 10, 11, 11, 12, 12], budg: [7.0, 8.0, 8.0, 8.5, 8.5, 8.5, 8.5] },
  support: { users: [13, 14, 14, 15, 15, 15, 15], proj: [5, 6, 6, 7, 7, 7, 7], budg: [4.0, 4.5, 4.0, 4.0, 4.2, 4.1, 4.1] },
};

const DEPT_COLORS: Record<string, { accent: string; light: string; icon: string; label: string }> = {
  it: { accent: "#4A90D9", light: "#D6E9F8", icon: "💻", label: "ฝ่าย IT" },
  academic: { accent: "#8B1515", light: "#FCE4E8", icon: "📚", label: "ฝ่ายวิชาการ" },
  support: { accent: "#059669", light: "#D4EDDA", icon: "🛠️", label: "ฝ่ายสนับสนุน" },
};

type DeptKey = "it" | "academic" | "support";
type ViewMode = "overview" | "weekly" | "trend" | "proportion" | "comparison";
const DEPT_KEYS: DeptKey[] = ["it", "academic", "support"];

/* ─── SVG Donut Chart Helper ─── */
function DonutChart({ segments, size = 80, strokeW = 8 }: { segments: { val: number; color: string; label: string }[]; size?: number; strokeW?: number }) {
  const r = (size - strokeW) / 2;
  const cx = size / 2, cy = size / 2;
  const total = segments.reduce((s, seg) => s + seg.val, 0) || 1;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const arcs = segments.map(seg => {
    const len = (seg.val / total) * circ;
    const o = offset; offset += len;
    return { len, offset: o, color: seg.color, label: seg.label, val: seg.val };
  });
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full max-w-[100px] max-h-[100px]">
      {arcs.map((a, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={a.color} strokeWidth={strokeW}
          strokeDasharray={`${a.len} ${circ - a.len}`} strokeDashoffset={-a.offset}
          transform={`rotate(-90 ${cx} ${cy})`} />
      ))}
      <text x={cx} y={cy + 3} textAnchor="middle" className="text-[11px] font-bold" fill="#1A1A2E">{total}</text>
    </svg>
  );
}

{/* ─── Overview Chart for one department (3 charts in a row) ─── */}
function DeptOverviewChart({ d, dk, deptTotals }: {
  d: { n: string; s: number; p: number; bu: number; bt: number };
  dk: DeptKey;
  deptTotals: { s: number; p: number; bu: number; bt: number };
}) {
  const budgPct = Math.min((d.bu / d.bt) * 100, 100);
  const staffPct = (d.s / deptTotals.s) * 100;
  const projPct = (d.p / deptTotals.p) * 100;
  const otherStaff = deptTotals.s - d.s;
  const deptBudgTotal = DEPT_KEYS.reduce((s, k) => s + DEPT[k].bt, 0);
  const otherBudg = deptBudgTotal - d.bt;
  const accent = DEPT_COLORS[dk].accent;

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Chart 1: บุคลากร — Donut + Bar */}
      <div>
        <h4 className="text-[11px] font-semibold text-[#1A1A2E] mb-2">👥 บุคลากร</h4>
        <div className="flex items-center gap-3">
          <DonutChart segments={[
            { val: d.s, color: accent, label: d.n },
            { val: otherStaff, color: "#E5E7EB", label: "อื่นๆ" },
          ]} size={70} strokeW={7} />
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-[#1A1A2E]">{FMT(d.s)}<span className="text-[10px] font-normal text-[#6B7280]"> คน</span></p>
            <div className="w-full bg-gray-100 h-2 mt-1"><div className="h-2" style={{ width: `${staffPct}%`, backgroundColor: accent }} /></div>
            <p className="text-[9px] text-[#9CA3AF] mt-0.5">{staffPct.toFixed(0)}% ของทั้งหมด {deptTotals.s} คน</p>
          </div>
        </div>
      </div>

      {/* Chart 2: โครงการ — Bar horizontal comparison */}
      <div>
        <h4 className="text-[11px] font-semibold text-[#1A1A2E] mb-2">📋 โครงการ</h4>
        <div className="space-y-2">
          {DEPT_KEYS.map(k => {
            const v = DEPT[k];
            const isSelf = k === dk;
            return (
              <div key={k} className="flex items-center gap-2">
                <span className="text-[10px] text-[#6B7280] w-16 truncate">{DEPT_COLORS[k].label}</span>
                <div className="flex-1 bg-gray-100 h-3">
                  <div className="h-3" style={{ width: `${(v.p / deptTotals.p) * 100}%`, backgroundColor: DEPT_COLORS[k].accent, opacity: isSelf ? 1 : 0.4 }} />
                </div>
                <span className={`text-[10px] font-mono w-6 text-right ${isSelf ? "font-bold text-[#1A1A2E]" : "text-[#9CA3AF]"}`}>{v.p}</span>
              </div>
            );
          })}
          <p className="text-[9px] text-[#9CA3AF] text-right">รวม {deptTotals.p} โครงการ</p>
        </div>
      </div>

      {/* Chart 3: งบประมาณ — Gauge-style progress */}
      <div>
        <h4 className="text-[11px] font-semibold text-[#1A1A2E] mb-2">💰 งบประมาณ</h4>
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <svg viewBox="0 0 64 64" className="w-[70px] h-[70px] -rotate-90">
              <circle cx="32" cy="32" r="26" fill="none" stroke="#E5E7EB" strokeWidth="8" />
              <circle cx="32" cy="32" r="26" fill="none" stroke={accent} strokeWidth="8"
                strokeDasharray={`${(budgPct / 100) * 163.36} 163.36`} strokeLinecap="butt" />
            </svg>
            <span className="absolute text-xs font-bold text-[#1A1A2E]">{budgPct.toFixed(0)}%</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-[#1A1A2E]">฿{(d.bu / 10).toFixed(1)}M</p>
            <p className="text-[10px] text-[#6B7280]">ใช้ไปแล้ว</p>
            <p className="text-[9px] text-[#9CA3AF] mt-0.5">จาก ฿{(d.bt / 10).toFixed(1)}M</p>
            <p className="text-[9px] text-[#9CA3AF]">คงเหลือ ฿{((d.bt - d.bu) / 10).toFixed(1)}M</p>
          </div>
        </div>
      </div>

    </div>
  );
}

/* ─── Weekly Chart for one department ─── */
function DeptWeeklyChart({ d }: { d: { n: string } }) {
  const maxOn = Math.max(...WK.map(w => w.on));
  return (
    <div>
      <div className="flex items-end gap-2 h-28 mb-2">
        {WK.map((w, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col-reverse" style={{ height: "80px" }}>
              {w.mt > 0 && <div className="w-full bg-yellow-400" style={{ height: `${(w.mt / 7) * 80}px` }} />}
              {w.off > 0 && <div className="w-full bg-red-400" style={{ height: `${(w.off / 7) * 80}px` }} />}
              {w.on > 0 && <div className="w-full bg-green-500 rounded-t" style={{ height: `${(w.on / 7) * 80}px` }} />}
            </div>
            <span className="text-[10px] text-[#9CA3AF]">{w.d}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-4 text-[10px]">
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded" /> ออนไลน์</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-400 rounded" /> ออฟไลน์</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-yellow-400 rounded" /> บำรุงรักษา</span>
      </div>
    </div>
  );
}

/* ─── Trend Chart for one department ─── */
function DeptTrendChart({ dk }: { dk: DeptKey }) {
  const td = DEPT_TREND[dk];
  const series = [
    { lb: "ผู้ใช้งาน", cl: "#8B1515", d: td.users },
    { lb: "โครงการ", cl: "#FDB813", d: td.proj },
    { lb: "งบประมาณ (แสน)", cl: "#059669", d: td.budg },
  ];
  return (
    <div className="space-y-4">
      {series.map(s => {
        const mx = Math.max(...s.d);
        return (
          <div key={s.lb}>
            <p className="text-[10px] text-[#6B7280] mb-1">{s.lb}</p>
            <div className="flex items-end gap-1 h-20">
              {s.d.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <span className="text-[10px] font-mono text-[#1A1A2E]">{val}</span>
                  <div className="w-full rounded-t" style={{ height: `${(val / mx) * 100}%`, backgroundColor: s.cl }} />
                  <span className="text-[10px] text-[#9CA3AF]">{TRM[i]}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Proportion Chart for one department ─── */
function DeptProportionChart({ d, dk }: { d: { n: string; s: number; p: number; bu: number; bt: number }; dk: DeptKey }) {
  const deptTotal = DEPT_KEYS.reduce((s, k) => s + DEPT[k].s, 0);
  const otherStaff = deptTotal - d.s;
  const deptBudgTotal = DEPT_KEYS.reduce((s, k) => s + DEPT[k].bt, 0);
  const otherBudg = deptBudgTotal - d.bt;
  return (
    <div className="flex items-center gap-6 flex-wrap">
      <div className="flex flex-col items-center gap-2">
        <p className="text-[10px] text-[#6B7280]">บุคลากร</p>
        <DonutChart segments={[
          { val: d.s, color: DEPT_COLORS[dk].accent, label: d.n },
          { val: otherStaff, color: "#E5E7EB", label: "อื่นๆ" },
        ]} />
        <div className="flex items-center gap-2 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: DEPT_COLORS[dk].accent }} /> {d.n} ({d.s})</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#E5E7EB]" /> อื่นๆ ({otherStaff})</span>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-[10px] text-[#6B7280]">งบประมาณ</p>
        <DonutChart segments={[
          { val: d.bt, color: DEPT_COLORS[dk].accent, label: d.n },
          { val: otherBudg, color: "#E5E7EB", label: "อื่นๆ" },
        ]} />
        <div className="flex items-center gap-2 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: DEPT_COLORS[dk].accent }} /> ฿{(d.bt / 10).toFixed(1)}M</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#E5E7EB]" /> ฿{(otherBudg / 10).toFixed(1)}M</span>
        </div>
      </div>
      <div className="flex-1 min-w-[180px] space-y-3">
        <div>
          <div className="flex justify-between text-[10px] mb-0.5"><span className="text-[#6B7280]">การใช้จ่ายงบประมาณ</span><span className="text-[#1A1A2E] font-medium">{((d.bu / d.bt) * 100).toFixed(0)}%</span></div>
          <div className="w-full bg-gray-100 h-3"><div className="h-3" style={{ width: `${(d.bu / d.bt) * 100}%`, backgroundColor: DEPT_COLORS[dk].accent }} /></div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] mb-0.5"><span className="text-[#6B7280]">สัดส่วนโครงการ</span><span className="text-[#1A1A2E] font-medium">{((d.p / AP) * 100).toFixed(0)}%</span></div>
          <div className="w-full bg-gray-100 h-3"><div className="h-3 bg-[#FDB813]" style={{ width: `${(d.p / AP) * 100}%` }} /></div>
        </div>
      </div>
    </div>
  );
}

/* ─── Comparison Chart for one department ─── */
function DeptComparisonChart({ dk }: { dk: DeptKey }) {
  const allDepts = DEPT_KEYS.map(k => DEPT[k]);
  const maxS = Math.max(...allDepts.map(d => d.s));
  const maxP = Math.max(...allDepts.map(d => d.p));
  const maxBt = Math.max(...allDepts.map(d => d.bt));
  const rows = [
    { lb: "บุคลากร", vals: allDepts.map(d => d.s), max: maxS, unit: "คน" },
    { lb: "โครงการ", vals: allDepts.map(d => d.p), max: maxP, unit: "โครงการ" },
    { lb: "งบประมาณ", vals: allDepts.map(d => d.bt), max: maxBt, unit: "M", fmt: (v: number) => `฿${(v / 10).toFixed(1)}M` },
    { lb: "ใช้ไป %", vals: allDepts.map(d => (d.bu / d.bt) * 100), max: 100, unit: "%", fmt: (v: number) => `${v.toFixed(0)}%` },
  ];
  const deptIndex = DEPT_KEYS.indexOf(dk);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        {allDepts.map((d, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5" style={{ backgroundColor: DEPT_COLORS[DEPT_KEYS[i]].accent }} />
            <span className="text-[10px] text-[#6B7280]">{d.n}</span>
          </div>
        ))}
      </div>
      {rows.map(row => (
        <div key={row.lb}>
          <p className="text-[10px] text-[#6B7280] mb-1">{row.lb}</p>
          <div className="flex items-end gap-1 h-16">
            {row.vals.map((v, i) => {
              const pct = (v / row.max) * 100;
              const isSelf = i === deptIndex;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <span className={`text-[10px] font-mono ${isSelf ? "font-bold text-[#1A1A2E]" : "text-[#9CA3AF]"}`}>
                    {row.fmt ? row.fmt(v) : `${v} ${row.unit}`}
                  </span>
                  <div className="w-full rounded-t" style={{
                    height: `${Math.max(pct, 4)}%`,
                    backgroundColor: DEPT_COLORS[DEPT_KEYS[i]].accent,
                    opacity: isSelf ? 1 : 0.5,
                  }} />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Department Card ─── */
function DepartmentCard({ dk, viewMode }: { dk: DeptKey; viewMode: ViewMode }) {
  const d = DEPT[dk];
  const cl = DEPT_COLORS[dk];
  const deptTotals = { s: AS, p: AP, bu: ABU, bt: ABT };
  return (
    <div className="bg-white border border-[#D1D5DB]">
      {/* Card Header */}
      <div className="px-5 py-3 border-b border-[#D1D5DB] flex items-center gap-3" style={{ borderLeftWidth: "4px", borderLeftColor: cl.accent }}>
        <span className="text-lg">{cl.icon}</span>
        <div>
          <h3 className="text-sm font-bold text-[#1A1A2E]">{cl.label}</h3>
          <p className="text-[10px] text-[#6B7280]">{d.s} คน · {d.p} โครงการ · งบฯ ฿{(d.bt / 10).toFixed(1)}M</p>
        </div>
      </div>
      {/* Chart Area */}
      <div className="p-5">
        {viewMode === "overview" && <DeptOverviewChart d={d} dk={dk} deptTotals={deptTotals} />}
        {viewMode === "weekly" && <DeptWeeklyChart d={d} />}
        {viewMode === "trend" && <DeptTrendChart dk={dk} />}
        {viewMode === "proportion" && <DeptProportionChart d={d} dk={dk} />}
        {viewMode === "comparison" && <DeptComparisonChart dk={dk} />}
      </div>
    </div>
  );
}

function formatThaiDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()} ${TM[d.getMonth()]} ${d.getFullYear() + 543}`;
}

/* ═══════════════════════════════════════════════════════════════
   Advanced Search Modal
   ═══════════════════════════════════════════════════════════════ */

function AdvancedSearchModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [keyword, setKeyword] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set());

  const toggleCat = (id: string) => {
    setSelectedCats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const handleReset = () => {
    setKeyword(""); setDateFrom(""); setDateTo(""); setSelectedCats(new Set());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white border border-[#FDB813] p-6 w-full max-w-lg mx-4 shadow-xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-[#8B1515]" strokeWidth={2} />
          <h3 className="text-sm font-semibold text-[#1A1A2E]">ค้นหาขั้นสูง</h3>
        </div>

        {/* Keyword */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-[#1A1A2E] mb-1">คำสำคัญ</label>
          <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30" placeholder="ค้นหาเอกสาร, โครงการ, บุคลากร, ระบบ..." />
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
          <button onClick={onClose}
            className="ml-auto px-4 py-2 text-sm font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800] focus:outline-none focus:ring-2 focus:ring-[#FDB813]/50 focus:ring-offset-2 cursor-pointer transition-all">
            ค้นหา
          </button>
        </div>
      </div>
    </div>
  );
}

function CalendarWidget({ events, categories }: { events: CalendarEvent[]; categories: Record<string, { label: string; hex: string }> }) {
  const now = new Date(); const currentYear = now.getFullYear(), currentMonth = now.getMonth(), todayDate = now.getDate();
  const todayStr = now.toISOString().split("T")[0];
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const eventsByDay = useMemo(() => { const map = new Map<number, CalendarEvent[]>(); events.forEach((ev) => { const d = new Date(ev.date); if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) { const day = d.getDate(); if (!map.has(day)) map.set(day, []); map.get(day)!.push(ev); } }); return map; }, [events, currentYear, currentMonth]);
  const getEventsForDay = (day: number) => { const direct = eventsByDay.get(day) || []; const spanning = events.filter((ev) => { if (!ev.endDate) return false; const start = new Date(ev.date); const end = new Date(ev.endDate); return start.getFullYear() === currentYear && start.getMonth() === currentMonth && day >= start.getDate() && day <= end.getDate(); }); return [...direct, ...spanning.filter((s) => !direct.some((d) => d.id === s.id))]; };
  const firstDay = new Date(currentYear, currentMonth, 1).getDay(); const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const catColorMap = useMemo(() => Object.fromEntries(Object.entries(categories).map(([k, v]) => [k, v.hex])), [categories]);
  const displayEvents = useMemo(() => { let list = events.filter((ev) => { const d = new Date(ev.date); return d.getFullYear() === currentYear && d.getMonth() === currentMonth; }).sort((a, b) => a.date.localeCompare(b.date)); if (selectedDay !== null) { const selectedEvents = getEventsForDay(selectedDay); const ids = new Set(selectedEvents.map((e) => e.id)); list = list.filter((e) => ids.has(e.id)); } return list; // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, currentYear, currentMonth, selectedDay]);
  const monthName = TM[currentMonth]; const yearThai = currentYear + 543;
  return (
    <div className="bg-white border border-[#D1D5DB]">
      <div className="p-5 pb-3">
        <div className="flex items-center gap-2"><Calendar className="w-5 h-5 text-[#A31D1D]" strokeWidth={2} /><h3 className="text-sm font-semibold text-[#1A1A2E]">ปฏิทินกิจกรรม</h3><span className="text-[10px] text-[#9CA3AF]">M365 Calendar</span></div>
        <div className="flex items-center justify-between mt-2"><h4 className="text-base font-bold text-[#8B1515]">{monthName} {yearThai}</h4>{selectedDay && <button onClick={() => setSelectedDay(null)} className="text-[10px] text-[#A31D1D] hover:underline font-medium flex items-center gap-1"><X className="w-3 h-3" strokeWidth={2} />แสดงทั้งหมด</button>}</div>
      </div>
      <div className="px-3 pb-3">
        <table className="w-full text-center border-collapse"><thead><tr>{["อา","จ","อ","พ","พฤ","ศ","ส"].map((dh) => <th key={dh} className="text-[11px] font-medium text-[#6B7280] py-2">{dh}</th>)}</tr></thead>
          <tbody>{Array.from({ length: Math.ceil((firstDay + daysInMonth) / 7) }).map((_, weekIdx) => <tr key={weekIdx}>{Array.from({ length: 7 }).map((_, dayIdx) => {
            const dayNum = weekIdx * 7 + dayIdx - firstDay + 1, isValid = dayNum >= 1 && dayNum <= daysInMonth, isToday = isValid && dayNum === todayDate, isSelected = isValid && dayNum === selectedDay, dayEvents = isValid ? getEventsForDay(dayNum) : [];
            return <td key={dayIdx} className="py-1 align-top">{isValid && <button onClick={() => setSelectedDay(selectedDay === dayNum ? null : dayNum)} className="w-full group min-h-[44px] flex flex-col items-center justify-start"><div className={`w-9 h-9 mx-auto flex items-center justify-center text-xs font-medium rounded-full transition-colors ${isToday ? "bg-[#8B1515] text-white font-bold shadow-sm" : isSelected ? "bg-[#FDB813] text-[#1A1A2E] font-bold ring-2 ring-[#FDB813]/50" : dayEvents.length > 0 ? "text-[#1A1A2E] group-hover:bg-[#FDB813]/10" : "text-[#9CA3AF] group-hover:bg-gray-50"}`}>{dayNum}</div>{dayEvents.length > 0 && <div className="flex justify-center gap-[3px] mt-1 flex-wrap max-w-[60px]">{(() => { const seen = new Set<string>(); return dayEvents.filter((ev) => { if (seen.has(ev.category)) return false; seen.add(ev.category); return true; }); })().map((ev) => <span key={ev.category} className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: catColorMap[ev.category] || "#9ca3af" }} />)}{dayEvents.length > 3 && <span className="text-[9px] text-[#9CA3AF] leading-none">+{dayEvents.length - 3}</span>}</div>}</button>}</td>;
          })}</tr>)}</tbody></table>
      </div>
      <div className="px-5 pb-3 flex flex-wrap gap-2">{Object.entries(categories).map(([key, cat]) => <span key={key} className="text-[10px] px-1.5 py-0.5 font-medium flex items-center gap-1" style={{ color: cat.hex }}><span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.hex }} />{cat.label}</span>)}</div>
      <div className="border-t border-[#D1D5DB] p-5"><h4 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">{selectedDay ? `กิจกรรมวันที่ ${selectedDay} ${monthName} ${yearThai} (${displayEvents.length})` : `กิจกรรมเดือนนี้ (${displayEvents.length})`}</h4>{displayEvents.length === 0 ? <p className="text-xs text-[#9CA3AF] text-center py-4">{selectedDay ? "ไม่มีกิจกรรมในวันที่เลือก" : "ไม่มีกิจกรรมในเดือนนี้"}</p> : <div className="space-y-2 max-h-80 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">{displayEvents.map((ev) => { const cat = categories[ev.category] ?? { label: ev.category, hex: "#9CA3AF" }; const isToday = ev.date === todayStr; const isPast = ev.date < todayStr; return <div key={ev.id} className={`flex gap-3 p-2 border-l-2 transition-colors ${isToday ? "border-l-[#FDB813] bg-[#FDB813]/5" : isPast ? "border-l-[#D1D5DB] opacity-60" : "border-l-transparent hover:bg-gray-50"}`}><div className="text-center shrink-0 w-8"><p className="text-sm font-bold text-[#1A1A2E] leading-tight">{new Date(ev.date).getDate()}</p><p className="text-[9px] text-[#9CA3AF]">{TM[currentMonth]}</p></div><div className="flex-1 min-w-0"><p className="text-xs font-medium text-[#1A1A2E] leading-snug">{ev.title}</p><div className="flex items-center gap-2 mt-0.5 flex-wrap">{ev.endDate ? <span className="text-[10px] text-[#6B7280]">{formatThaiDate(ev.date)} - {formatThaiDate(ev.endDate)}</span> : ev.time && ev.endTime ? <span className="text-[10px] text-[#6B7280]">{ev.time} - {ev.endTime} น.</span> : ev.time ? <span className="text-[10px] text-[#6B7280]">{ev.time} น.</span> : <span className="text-[10px] text-[#6B7280]">ทั้งวัน</span>}<span className="text-[10px] px-1.5 py-0.5 font-medium flex items-center gap-1" style={{ color: cat.hex }}><span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.hex }} />{cat.label}</span>{isToday && <span className="text-[10px] text-[#FDB813] font-bold">วันนี้</span>}</div>{ev.location && <p className="text-[10px] text-[#9CA3AF] mt-0.5 truncate">{ev.location}</p>}</div></div>; })}</div>}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const userRoles = useMemo(() => (session?.user as Record<string, unknown>)?.roles as string[] ?? [], [session?.user]);
  const { allCalendarEvents, allCategories } = useAppHub();
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const vtabs = [
    { key: "overview" as const, label: "📊 ภาพรวม" }, { key: "weekly" as const, label: "📅 รายสัปดาห์" },
    { key: "trend" as const, label: "📈 แนวโน้ม" }, { key: "proportion" as const, label: "🥧 สัดส่วน" }, { key: "comparison" as const, label: "⚖️ เปรียบเทียบ" },
  ];

  return (
    <div className="pt-0 px-6 pb-8">
      <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">Dashboard</h1>
      <p className="text-sm text-[#6B7280] mb-6">ภาพรวมข้อมูลสำคัญของคณะนิติศาสตร์</p>
      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0">
        <div className="space-y-4">
          {/* Search */}
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" strokeWidth={2} />
              <input type="text" placeholder="ค้นหาเอกสาร, โครงการ, บุคลากร, ระบบ..." className="w-full pl-10 pr-4 py-2 text-sm border border-[#D1D5DB] bg-white placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30" />
            </div>
            <div className="flex items-center justify-end mt-1">
              <button onClick={() => setShowAdvancedSearch(true)}
                className="text-[11px] font-medium text-[#A31D1D] hover:text-[#8B1515] transition-colors flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" strokeWidth={2} />
                ค้นหาขั้นสูง
              </button>
            </div>
          </div>

          {/* Announcements */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Megaphone className="w-5 h-5 text-[#FDB813]" strokeWidth={2} />
              <h3 className="text-sm font-bold text-[#1A1A2E]">ประกาศสำคัญ</h3>
            </div>
            <div className="bg-gradient-to-r from-[#8B1515] to-[#A31D1D] border-l-4 border-[#FDB813] p-4 space-y-2">
              {ANNS.map(a => <a key={a.id} href="#" className={`block text-sm hover:text-[#FDB813] font-medium transition-colors ${a.ty === "urgent" ? "text-white" : "text-white/80"}`}>{a.ty === "urgent" ? "⚡ " : a.ty === "meeting" ? "📌 " : a.ty === "deadline" ? "📋 " : "📢 "}{a.t}</a>)}
            </div>
          </div>

          {/* View Mode Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-1 bg-[#F5F5F5] p-1 rounded w-fit">
              {vtabs.map(v => <button key={v.key} onClick={() => setViewMode(v.key)} className={`px-4 py-2 text-sm font-medium transition-colors rounded cursor-pointer ${viewMode === v.key ? "bg-[#FDB813] text-[#1A1A2E]" : "text-[#6B7280] hover:text-[#1A1A2E]"}`}>{v.label}</button>)}
            </div>
          </div>

          {/* 3 Department Cards — stacked vertically */}
          <div className="space-y-4">
            {DEPT_KEYS.map(dk => (
              <DepartmentCard key={dk} dk={dk} viewMode={viewMode} />
            ))}
          </div>
        </div>
        </div>
        <div className="w-80 shrink-0">
          <CalendarWidget events={allCalendarEvents} categories={allCategories} />
        </div>
      </div>
      {/* Advanced Search Modal */}
      {showAdvancedSearch && (
        <AdvancedSearchModal
          onClose={() => setShowAdvancedSearch(false)}
        />
      )}
    </div>
  );
}
