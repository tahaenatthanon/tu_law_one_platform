"use client";

import { useState, useMemo, useEffect } from "react";
import {
  appCategories,
  type Application,
  type AppStatus,
  type CalendarEvent,
} from "@/lib/app-data";
import { useAppHub } from "@/lib/app-hub-context";

/* ═══════════════════════════════════════════════════════════════
   Helpers (shared)
   ═══════════════════════════════════════════════════════════════ */

const THAI_MONTHS = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

function formatThaiDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`;
}

const statusMap: Record<AppStatus, { label: string; dot: string }> = {
  online: { label: "ออนไลน์", dot: "bg-green-500" },
  offline: { label: "ออฟไลน์", dot: "bg-red-500" },
  maintenance: { label: "กำลังบำรุงรักษา", dot: "bg-yellow-500" },
};

const eventCategoryMap: Record<CalendarEvent["category"], { label: string; dot: string; text: string; hex: string }> = {
  meeting: { label: "ประชุม", dot: "bg-purple-500", text: "text-purple-600", hex: "#a855f7" },
  seminar: { label: "สัมมนา", dot: "bg-blue-500", text: "text-blue-600", hex: "#3b82f6" },
  exam: { label: "สอบ", dot: "bg-orange-500", text: "text-orange-600", hex: "#f97316" },
  holiday: { label: "วันหยุด", dot: "bg-red-500", text: "text-red-500", hex: "#ef4444" },
  deadline: { label: "กำหนดส่ง", dot: "bg-pink-500", text: "text-pink-600", hex: "#ec4899" },
};

/* ─── Custom status dropdown (สีแยกต่อ option) ─── */
const statusOptions: { value: AppStatus; label: string; color: string; dot: string }[] = [
  { value: "online", label: "ออนไลน์", color: "text-green-600", dot: "bg-green-500" },
  { value: "offline", label: "ออฟไลน์", color: "text-red-500", dot: "bg-red-500" },
  { value: "maintenance", label: "บำรุงรักษา", color: "text-yellow-600", dot: "bg-yellow-500" },
];

function StatusSelect({ value, onChange, size }: { value: AppStatus; onChange: (v: AppStatus) => void; size?: "sm" | "xs" }) {
  const [open, setOpen] = useState(false);
  const selected = statusOptions.find((o) => o.value === value)!;
  const isXs = size === "xs";
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={`${isXs ? "text-[10px] px-1.5 py-0.5" : "text-[11px] px-2 py-1"} border border-[#D1D5DB] bg-white hover:border-[#FDB813] focus:outline-none focus:border-[#FDB813] focus:ring-1 focus:ring-[#FDB813]/30 cursor-pointer transition-colors flex items-center gap-1 ${selected.color}`}
      >
        <span className={`inline-block rounded-full ${isXs ? "w-1.5 h-1.5" : "w-2 h-2"} ${selected.dot}`} />
        {selected.label}
        <svg className={`${isXs ? "w-2.5 h-2.5" : "w-3 h-3"} ml-0.5 opacity-50`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-50 top-full mt-1 right-0 bg-white border border-[#D1D5DB] shadow-lg min-w-[110px]">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); onChange(opt.value); setOpen(false); }}
              className={`w-full flex items-center gap-1.5 ${isXs ? "text-[10px] px-2 py-1" : "text-[11px] px-2.5 py-1.5"} hover:bg-[#FDB813]/10 cursor-pointer transition-colors ${opt.color} ${value === opt.value ? "bg-[#FDB813]/10 font-medium" : ""}`}
            >
              <span className={`inline-block rounded-full ${isXs ? "w-1.5 h-1.5" : "w-2 h-2"} ${opt.dot}`} />
              {opt.label}
              {value === opt.value && (
                <svg className="w-3 h-3 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Custom category dropdown (จุดสีแยกตามประเภทกิจกรรม) ─── */
const baseCategoryOptions = Object.entries(eventCategoryMap).map(([key, cat]) => ({
  value: key as CalendarEvent["category"],
  label: cat.label,
  hex: cat.hex,
}));

function CategorySelect({ value, onChange, extras, overrides }: { value: string; onChange: (v: string) => void; extras?: { key: string; label: string; hex: string }[]; overrides?: Record<string, { hex: string }> }) {
  const [open, setOpen] = useState(false);
  const baseWithOverrides = baseCategoryOptions.map((o) => {
    const ov = overrides?.[o.value];
    return ov ? { ...o, hex: ov.hex } : o;
  });
  const allOptions = [...baseWithOverrides, ...(extras ?? []).map((c) => ({ value: c.key, label: c.label, hex: c.hex }))];
  const selected = allOptions.find((o) => o.value === value) ?? { value, label: value, hex: "#9ca3af" };
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="w-full px-3 py-2 text-sm border border-[#D1D5DB] bg-white hover:border-[#FDB813] focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30 cursor-pointer transition-colors flex items-center gap-1.5 text-[#1A1A2E]"
      >
        <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: selected.hex }} />
        {selected.label}
        <svg className="w-3 h-3 ml-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-[#D1D5DB] shadow-lg">
          {allOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); onChange(opt.value); setOpen(false); }}
              className={`w-full flex items-center gap-1.5 text-sm px-3 py-2 hover:bg-[#FDB813]/10 cursor-pointer transition-colors text-[#1A1A2E] ${value === opt.value ? "bg-[#FDB813]/10 font-medium" : ""}`}
            >
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: opt.hex }} />
              {opt.label}
              {value === opt.value && (
                <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Custom location dropdown ─── */
const locationOptions = [
  { value: "", label: "— ไม่ระบุ —" },
  { value: "ห้องประชุมใหญ่ ชั้น 5 คณะนิติศาสตร์", label: "ห้องประชุมใหญ่ ชั้น 5" },
  { value: "ห้องประชุมศาสตราจารย์สัญญา ธรรมศักดิ์", label: "ห้องประชุมสัญญา ธรรมศักดิ์" },
  { value: "ห้องประชุมคณบดี", label: "ห้องประชุมคณบดี" },
  { value: "ห้องฝึกอบรม IT ชั้น 2", label: "ห้องฝึกอบรม IT ชั้น 2" },
  { value: "หอประชุมใหญ่ มธ. ท่าพระจันทร์", label: "หอประชุมใหญ่ ท่าพระจันทร์" },
  { value: "ห้องประชุมชั้น 3 อาคารป๋วย อึ๊งภากรณ์", label: "ห้องประชุม ป๋วยฯ ชั้น 3" },
];

function LocationSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [customText, setCustomText] = useState("");
  const isCustom = value && !locationOptions.some((o) => o.value === value);

  const getLabel = () => {
    if (isCustom || value === "__custom__") return value === "__custom__" ? "— ระบุเอง —" : value;
    if (!value) return "— ไม่ระบุ —";
    return locationOptions.find((o) => o.value === value)?.label ?? value;
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="w-full px-3 py-2 text-sm border border-[#D1D5DB] bg-white hover:border-[#FDB813] focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30 cursor-pointer transition-colors flex items-center gap-1.5 text-[#1A1A2E]"
      >
        <svg className="w-4 h-4 shrink-0 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="truncate">{getLabel()}</span>
        <svg className="w-3 h-3 ml-auto opacity-50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-[#D1D5DB] shadow-lg max-h-56 overflow-y-auto">
          <div className="px-2 pt-2 pb-1 border-b border-[#D1D5DB]">
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="ระบุสถานที่เอง..."
              className="w-full px-2 py-1.5 text-xs border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813]"
              onMouseDown={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); if (customText.trim()) { onChange(customText.trim()); setOpen(false); setCustomText(""); } }}
              disabled={!customText.trim()}
              className="w-full mt-1 text-[10px] py-1 px-2 bg-[#FDB813] text-[#1A1A2E] font-medium hover:bg-[#E5A800] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ใช้ค่านี้
            </button>
          </div>
          {locationOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); onChange(opt.value); setOpen(false); }}
              className={`w-full flex items-center gap-1.5 text-sm px-3 py-2 hover:bg-[#FDB813]/10 cursor-pointer transition-colors text-[#1A1A2E] ${value === opt.value ? "bg-[#FDB813]/10 font-medium" : ""}`}
            >
              <span className="truncate">{opt.label}</span>
              {value === opt.value && (
                <svg className="w-4 h-4 ml-auto shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Admin Panel — จัดการ Application
   ═══════════════════════════════════════════════════════════════ */

function AdminPanel({
  appList, onAdd, onUpdate, onRemove, onUpdateAppStatus,
}: {
  appList: Application[];
  onAdd: (app: Application) => void;
  onUpdate: (id: string, updates: Partial<Application>) => void;
  onRemove: (id: string) => void;
  onUpdateAppStatus: (id: string, status: AppStatus) => void;
}) {
  const [showStatusPanel, setShowStatusPanel] = useState(false);
  const [showEditInfoPanel, setShowEditInfoPanel] = useState(false);
  const [deleteAppTarget, setDeleteAppTarget] = useState<Application | null>(null);

  const [editModal, setEditModal] = useState<{
    editingId: string | null;
    name: string; description: string; url: string;
    category: string; status: AppStatus;
  } | null>(null);

  const [pendingStatusChanges, setPendingStatusChanges] = useState<Map<string, AppStatus>>(new Map());

  const getEffectiveStatus = (app: Application) =>
    pendingStatusChanges.get(`app:${app.id}`) ?? app.status;

  const setPendingApp = (id: string, status: AppStatus) =>
    setPendingStatusChanges((prev) => new Map(prev).set(`app:${id}`, status));

  const applyPendingStatusChanges = () => {
    pendingStatusChanges.forEach((status, key) => {
      if (key.startsWith("app:")) {
        const appId = key.slice(4);
        onUpdateAppStatus(appId, status);
      }
    });
    setPendingStatusChanges(new Map());
  };

  const openAddForm = () => {
    setEditModal({ editingId: null, name: "", description: "", url: "", category: "erp", status: "online" });
  };

  const openEditForm = (app: Application) => {
    setEditModal({
      editingId: app.id, name: app.name, description: app.description, url: app.url,
      category: app.category, status: app.status,
    });
  };

  const closeEditModal = () => setEditModal(null);

  const updateField = (field: string, value: string) => {
    if (!editModal) return;
    setEditModal({ ...editModal, [field]: value });
  };

  const handleSubmit = () => {
    if (!editModal || !editModal.name || !editModal.url) return;
    if (editModal.editingId) {
      onUpdate(editModal.editingId, {
        name: editModal.name, description: editModal.description,
        url: editModal.url, category: editModal.category,
      });
    } else {
      onAdd({
        id: `custom-${Date.now()}`, name: editModal.name, description: editModal.description,
        url: editModal.url, icon: "M13 10V3L4 14h7v7l9-11h-7z",
        category: editModal.category, status: editModal.status, subApps: [],
        allowedRoles: ["super_admin", "system_admin"],
      });
    }
    setEditModal(null);
  };

  return (
    <>
      <div className="bg-white border border-[#FDB813]/50 p-5 mt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#8B1515]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-sm font-semibold text-[#1A1A2E]">จัดการแอปพลิเคชัน</h3>
            <span className="text-[10px] px-2 py-0.5 bg-[#8B1515] text-white rounded-full font-medium">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowStatusPanel(true)}
              className="px-4 py-2 text-sm font-medium border border-[#D1D5DB] bg-white text-[#1A1A2E] hover:border-[#FDB813] hover:bg-[#FDB813]/5 focus:outline-none focus:ring-2 focus:ring-[#FDB813]/50 cursor-pointer transition-all">
              เปลี่ยนสถานะ
            </button>
            <button onClick={() => setShowEditInfoPanel(true)}
              className="px-4 py-2 text-sm font-medium border border-[#D1D5DB] bg-white text-[#1A1A2E] hover:border-[#FDB813] hover:bg-[#FDB813]/5 focus:outline-none focus:ring-2 focus:ring-[#FDB813]/50 cursor-pointer transition-all flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              แก้ไขข้อมูล
            </button>
            <button onClick={openAddForm}
              className="px-4 py-2 text-sm font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800] focus:outline-none focus:ring-2 focus:ring-[#FDB813]/50 focus:ring-offset-2 cursor-pointer transition-all">
              + เพิ่มแอปพลิเคชัน
            </button>
          </div>
        </div>

        <p className="text-xs text-[#6B7280] mt-1">เพิ่ม/แก้ไข/ลบ Application — กำหนด URL, Icon และชื่อ</p>

        {/* Edit/Add Modal */}
        {editModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={closeEditModal}>
            <div className="bg-white border border-[#FDB813] shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <h4 className="text-sm font-semibold text-[#1A1A2E] mb-4">{editModal.editingId ? "✏️ แก้ไขแอปพลิเคชัน" : "➕ เพิ่มแอปพลิเคชันใหม่"}</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#1A1A2E] mb-1">ชื่อแอปพลิเคชัน *</label>
                    <input type="text" value={editModal.name} onChange={(e) => updateField("name", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30" placeholder="ระบบทะเบียนนักศึกษา" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1A1A2E] mb-1">URL *</label>
                    <input type="text" value={editModal.url} onChange={(e) => updateField("url", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1A1A2E] mb-1">คำอธิบาย</label>
                    <input type="text" value={editModal.description} onChange={(e) => updateField("description", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30" placeholder="คำอธิบายสั้นๆ" />
                  </div>
                  <div className={`grid ${editModal.editingId ? "grid-cols-1" : "grid-cols-2"} gap-3`}>
                    <div>
                      <label className="block text-xs font-medium text-[#1A1A2E] mb-1">หมวดหมู่</label>
                      <select value={editModal.category} onChange={(e) => updateField("category", e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#D1D5DB] bg-white focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30">
                        {appCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    {!editModal.editingId && (
                    <div>
                      <label className="block text-xs font-medium text-[#1A1A2E] mb-1">สถานะ</label>
                      <StatusSelect value={editModal.status} onChange={(v) => updateField("status", v)} />
                    </div>
                    )}
                  </div>
                </div>
              <div className="flex gap-2 justify-end mt-4">
                <button onClick={closeEditModal} className="px-4 py-2 text-sm font-medium border border-[#D1D5DB] text-[#6B7280] hover:bg-gray-100 hover:text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer transition-all">ยกเลิก</button>
                <button onClick={handleSubmit} disabled={!editModal.name || !editModal.url} className="px-5 py-2 text-sm font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800] shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#FDB813]/50 focus:ring-offset-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed">{editModal.editingId ? "บันทึกการแก้ไข" : "บันทึก"}</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Panel Modal */}
        {showStatusPanel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowStatusPanel(false)}>
            <div className="bg-white border border-[#FDB813] shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 pb-3 border-b border-[#D1D5DB] shrink-0">
                <div>
                  <h3 className="text-sm font-semibold text-[#1A1A2E]">เปลี่ยนสถานะแอปพลิเคชัน</h3>
                  <p className="text-[10px] text-[#9CA3AF] mt-0.5">เลือกสถานะจาก dropdown แล้วกดบันทึก</p>
                </div>
              </div>
              <div className="p-5 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {appList.map((app) => {
                    const pendingStatus = getEffectiveStatus(app);
                    const origStatus = app.status;
                    const appChanged = pendingStatusChanges.has(`app:${app.id}`);
                    return (
                      <div key={app.id} className={`text-xs border transition-colors p-2 flex items-center justify-between gap-2 ${appChanged ? "border-[#FDB813] bg-[#FDB813]/5" : "border-[#D1D5DB] bg-gray-50"}`}>
                        <div className="min-w-0 flex-1">
                          <span className="truncate font-medium text-[#1A1A2E] block">{app.name}</span>
                          <span className="text-[9px]">
                            <span className={`inline-block w-1.5 h-1.5 rounded-full ${statusMap[origStatus].dot}`} /> {statusMap[origStatus].label}
                            {appChanged && <span className="ml-1 text-[#FDB813] font-medium">→ {statusMap[pendingStatus].label}</span>}
                          </span>
                        </div>
                        <StatusSelect value={pendingStatus} onChange={(v) => setPendingApp(app.id, v)} />
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-end gap-2 p-5 pt-3 border-t border-[#D1D5DB] shrink-0">
                <button onClick={() => setShowStatusPanel(false)} className="px-5 py-2.5 text-sm font-medium border border-[#D1D5DB] text-[#6B7280] hover:bg-gray-100 hover:text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer transition-all">ปิด</button>
                <button onClick={applyPendingStatusChanges} disabled={pendingStatusChanges.size === 0} className="px-5 py-2.5 text-sm font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800] shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#FDB813]/50 focus:ring-offset-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed">บันทึก</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Info Panel Modal */}
        {showEditInfoPanel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowEditInfoPanel(false)}>
            <div className="bg-white border border-[#FDB813] shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 pb-3 border-b border-[#D1D5DB] shrink-0">
                <div>
                  <h3 className="text-sm font-semibold text-[#1A1A2E]">แก้ไขข้อมูลแอปพลิเคชัน</h3>
                  <p className="text-[10px] text-[#9CA3AF] mt-0.5">คลิก ✏️ เพื่อแก้ไขชื่อ, URL, หมวดหมู่ — คลิก 🗑️ เพื่อลบ</p>
                </div>
              </div>
              <div className="p-5 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {appList.map((app) => {
                    const isCustom = app.id.startsWith("custom-");
                    const isOffline = app.status === "offline";
                    return (
                      <div key={app.id} className="bg-white border border-[#D1D5DB] hover:border-[#FDB813]/50 hover:bg-[#FDB813]/5 transition-colors flex items-center gap-3 p-3">
                        <div className={`w-9 h-9 shrink-0 flex items-center justify-center ${isOffline ? "bg-gray-400" : "bg-[#8B1515]"}`}>
                          <svg className={`w-4 h-4 ${isOffline ? "text-gray-200" : "text-[#FDB813]"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={app.icon} />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-[13px] font-semibold text-[#1A1A2E] leading-tight">{app.name}</p>
                            {isCustom && (
                              <span className="text-[9px] px-1.5 py-0.5 bg-[#FDB813]/20 text-[#8B6914] rounded-full font-medium shrink-0">กำหนดเอง</span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#6B7280] mt-0.5 line-clamp-1 leading-snug">{app.description}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => { setShowEditInfoPanel(false); openEditForm(app); }}
                            className="px-2 py-1 text-xs font-medium bg-white border border-[#D1D5DB] hover:border-[#FDB813] hover:bg-[#FDB813]/10 hover:text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#FDB813]/30 cursor-pointer transition-all"
                            title="แก้ไขข้อมูล"
                          >
                            แก้ไข
                          </button>
                          <button
                            onClick={() => { setShowEditInfoPanel(false); setDeleteAppTarget(app); }}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer transition-colors"
                            title="ลบแอปพลิเคชัน"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-end gap-2 p-5 pt-3 border-t border-[#D1D5DB] shrink-0">
                <button onClick={() => setShowEditInfoPanel(false)} className="px-5 py-2.5 text-sm font-medium border border-[#D1D5DB] text-[#6B7280] hover:bg-gray-100 hover:text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer transition-all">ปิด</button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Apps */}
        {appList.filter((a) => a.id.startsWith("custom-")).length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#D1D5DB]">
            <span className="text-xs font-semibold text-[#6B7280]">แอปพลิเคชันที่เพิ่มโดยผู้ดูแล</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {appList.filter((a) => a.id.startsWith("custom-")).map((app) => (
                <span key={app.id} className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 border border-[#D1D5DB]">
                  {app.name}
                  <button onClick={() => openEditForm(app)} className="p-1 text-[#6B7280] hover:text-[#1A1A2E] cursor-pointer transition-colors" title="แก้ไขแอปพลิเคชัน">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => setDeleteAppTarget(app)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer transition-colors" title="ลบแอปพลิเคชัน">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteAppTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteAppTarget(null)}>
          <div className="bg-white border border-red-300 p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#1A1A2E]">ลบแอปพลิเคชัน</h4>
                <p className="text-[11px] text-[#6B7280] mt-0.5">การกระทำนี้ไม่สามารถย้อนกลับได้</p>
              </div>
            </div>
            <div className="p-3 bg-gray-50 border border-[#D1D5DB] mb-4">
              <p className="text-xs font-medium text-[#1A1A2E]">{deleteAppTarget!.name}</p>
              <p className="text-[10px] text-[#6B7280] mt-0.5">{deleteAppTarget!.description}</p>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteAppTarget(null)} className="px-4 py-2 text-sm font-medium border border-[#D1D5DB] text-[#6B7280] hover:bg-gray-100 hover:text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer transition-all">ยกเลิก</button>
              <button onClick={() => { onRemove(deleteAppTarget!.id); setDeleteAppTarget(null); }} className="px-5 py-2 text-sm font-semibold bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 cursor-pointer transition-all">ลบแอปพลิเคชัน</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Calendar Manager — จัดการปฏิทิน
   ═══════════════════════════════════════════════════════════════ */

function CalendarManager({
  events, onAddEvent, onUpdateEvent, onRemoveEvent,
}: {
  events: CalendarEvent[];
  onAddEvent: (ev: CalendarEvent) => void;
  onUpdateEvent: (id: string, ev: Partial<CalendarEvent>) => void;
  onRemoveEvent: (id: string) => void;
}) {
  const {
    allCategories,
    categoryColorOverrides,
    categoryNameOverrides,
    customCategories,
    updateCategoryColor,
    updateCategoryName,
    resetCategoryOverrides,
    addCustomCategory,
    removeCustomCategory,
    updateCustomCategoryColor,
  } = useAppHub();

  const [editModal, setEditModal] = useState<{
    editingId: string | null;
    title: string; date: string; endDate: string; time: string; endTime: string;
    location: string; category: CalendarEvent["category"]; description: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CalendarEvent | null>(null);
  const todayStr = new Date().toISOString().split("T")[0];

  // ── Local UI state for category popup only ──
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#a855f7");
  const [editingCatKey, setEditingCatKey] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState("");
  const [editingBuiltInKey, setEditingBuiltInKey] = useState<string | null>(null);
  const [editingBuiltInName, setEditingBuiltInName] = useState("");

  const catColors = [
    { id: "purple", hex: "#a855f7", label: "ม่วง" },
    { id: "blue", hex: "#3b82f6", label: "ฟ้า" },
    { id: "orange", hex: "#f97316", label: "ส้ม" },
    { id: "red", hex: "#ef4444", label: "แดง" },
    { id: "pink", hex: "#ec4899", label: "ชมพู" },
    { id: "green", hex: "#22c55e", label: "เขียว" },
    { id: "teal", hex: "#14b8a6", label: "ทีล" },
    { id: "indigo", hex: "#6366f1", label: "คราม" },
  ];

  const handleBuiltInColor = (key: string, hex: string) => {
    updateCategoryColor(key, hex);
  };

  const handleResetBuiltIn = (key: string) => {
    resetCategoryOverrides(key);
  };

  const handleSaveBuiltInName = () => {
    if (!editingBuiltInKey || !editingBuiltInName.trim()) return;
    updateCategoryName(editingBuiltInKey, editingBuiltInName.trim());
    setEditingBuiltInKey(null);
    setEditingBuiltInName("");
  };

  const handleCustomColor = (key: string, hex: string) => {
    updateCustomCategoryColor(key, hex);
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const key = `custom-${Date.now()}`;
    addCustomCategory(key, newCatName.trim(), newCatColor);
    setNewCatName("");
    setNewCatColor("#a855f7");
  };

  const handleDeleteCategory = (key: string) => {
    removeCustomCategory(key);
  };

  const handleEditCategory = (key: string) => {
    const cat = allCategories[key];
    if (cat) { setEditingCatKey(key); setEditingCatName(cat.label); }
  };

  const handleSaveEditCategory = () => {
    if (!editingCatKey || !editingCatName.trim()) return;
    updateCategoryName(editingCatKey, editingCatName.trim());
    setEditingCatKey(null); setEditingCatName("");
  };

  const getCat = (category: string): { label: string; hex: string } =>
    allCategories[category] ?? { label: category, hex: "#9ca3af" };

  const openAddForm = () => setEditModal({ editingId: null, title: "", date: todayStr, endDate: "", time: "", endTime: "", location: "", category: "seminar", description: "" });
  const openEditForm = (ev: CalendarEvent) => setEditModal({ editingId: ev.id, title: ev.title, date: ev.date, endDate: ev.endDate || "", time: ev.time || "", endTime: ev.endTime || "", location: ev.location || "", category: ev.category, description: ev.description || "" });
  const closeEditModal = () => setEditModal(null);
  const updateField = (field: string, value: string) => { if (!editModal) return; setEditModal({ ...editModal, [field]: value }); };

  const handleSubmit = () => {
    if (!editModal || !editModal.title || !editModal.date) return;
    if (editModal.editingId) {
      onUpdateEvent(editModal.editingId, { title: editModal.title, date: editModal.date, endDate: editModal.endDate || undefined, time: editModal.time || undefined, endTime: editModal.endTime || undefined, location: editModal.location || undefined, category: editModal.category, description: editModal.description || undefined });
    } else {
      onAddEvent({ id: `cal-custom-${Date.now()}`, title: editModal.title, date: editModal.date, endDate: editModal.endDate || undefined, time: editModal.time || undefined, endTime: editModal.endTime || undefined, location: editModal.location || undefined, category: editModal.category, description: editModal.description || undefined });
    }
    setEditModal(null);
  };

  const handleDelete = (ev: CalendarEvent) => setDeleteTarget(ev);
  const confirmDelete = () => { if (deleteTarget) { onRemoveEvent(deleteTarget.id); } setDeleteTarget(null); };

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const monthEvents = events
    .filter((ev) => { const d = new Date(ev.date); return d.getFullYear() === currentYear && d.getMonth() === currentMonth; })
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="bg-white border border-[#FDB813]/50 p-5 mt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#8B1515]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-sm font-semibold text-[#1A1A2E]">จัดการกิจกรรม</h3>
          <span className="text-[10px] px-2 py-0.5 bg-[#8B1515] text-white rounded-full font-medium">Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCategoryPopup(true)}
            className="px-4 py-2 text-sm font-medium border border-[#D1D5DB] bg-white text-[#1A1A2E] hover:border-[#FDB813] hover:bg-[#FDB813]/5 focus:outline-none focus:ring-2 focus:ring-[#FDB813]/50 cursor-pointer transition-all">
            จัดการประเภท
          </button>
          <button onClick={openAddForm} className="px-4 py-2 text-sm font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800] focus:outline-none focus:ring-2 focus:ring-[#FDB813]/50 focus:ring-offset-2 cursor-pointer transition-all">+ เพิ่มกิจกรรม</button>
        </div>
      </div>

      <p className="text-xs text-[#6B7280] mt-1">เพิ่ม/ลบ/แก้ไขกิจกรรม — คลิกแก้ไขหรือลบบนแต่ละรายการ</p>

      {monthEvents.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[#D1D5DB]">
          <span className="text-xs font-semibold text-[#6B7280]">กิจกรรมในเดือนนี้ ({monthEvents.length})</span>
          <div className="mt-2 space-y-1.5 max-h-56 overflow-y-auto">
            {monthEvents.map((ev) => {
              const cat = getCat(ev.category);
              return (
                <div key={ev.id} className="flex items-center justify-between gap-2 text-xs p-2 bg-gray-50 border border-[#D1D5DB] hover:border-[#FDB813] hover:bg-[#FDB813]/5 transition-colors">
                  <div className="min-w-0 flex items-center gap-1.5 flex-1">
                    <p className="font-medium text-[#1A1A2E] truncate">{ev.title}{ev.id.startsWith("cal-custom-") && <span className="ml-1 text-[9px] text-[#FDB813]">(กำหนดเอง)</span>}</p>
                    <span className="text-[10px] px-1.5 py-0.5 font-medium flex items-center gap-1 shrink-0" style={{ color: cat.hex }}><span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.hex }} />{cat.label}</span>
                    <p className="text-[10px] text-[#6B7280] truncate shrink-0">{formatThaiDate(ev.date)}{ev.time && ` ${ev.time}`}{ev.endTime && `-${ev.endTime}`}{ev.location && ` | ${ev.location}`}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => openEditForm(ev)} className="px-2 py-1 text-xs font-medium bg-white border border-[#D1D5DB] hover:border-[#FDB813] hover:text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#FDB813]/30 cursor-pointer transition-all">แก้ไข</button>
                    <button onClick={() => handleDelete(ev)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer transition-colors" title="ลบกิจกรรม">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Manager Popup */}
      {showCategoryPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowCategoryPopup(false)}>
          <div className="bg-white border border-[#FDB813] shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 pb-3 border-b border-[#D1D5DB] shrink-0">
              <div>
                <h3 className="text-sm font-semibold text-[#1A1A2E]">จัดการประเภทกิจกรรม</h3>
                <p className="text-[10px] text-[#9CA3AF] mt-0.5">แก้ไขสีของประเภทที่มีอยู่ หรือเพิ่มประเภทใหม่</p>
              </div>
              <button onClick={() => setShowCategoryPopup(false)} className="p-1 text-[#9CA3AF] hover:text-[#1A1A2E]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {/* Add new */}
              <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 border border-[#D1D5DB]">
                <input type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="ชื่อประเภทใหม่..."
                  className="flex-1 px-2 py-1.5 text-xs border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813]" />
                <input type="color" value={newCatColor} onChange={(e) => setNewCatColor(e.target.value)}
                  className="w-8 h-8 rounded-full cursor-pointer border border-[#D1D5DB] p-0 shadow-sm hover:shadow [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0"
                  title="เลือกสี" />
                <button onClick={handleAddCategory} disabled={!newCatName.trim()}
                  className="px-3 py-1.5 text-xs font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors shrink-0">
                  เพิ่ม
                </button>
              </div>

              {/* Built-in categories */}
              <p className="text-[10px] font-semibold text-[#6B7280] uppercase mb-1.5">ค่าเริ่มต้น (เปลี่ยนชื่อ/สีได้)</p>
              {Object.entries(eventCategoryMap).map(([key, cat]) => {
                const eff = allCategories[key];
                const isOverridden = !!(categoryColorOverrides[key] || categoryNameOverrides[key]);
                const currentHex = eff.hex;
                const isEditing = editingBuiltInKey === key;
                return (
                  <div key={key} className={`text-xs border mb-1 transition-colors ${isOverridden ? "bg-[#FDB813]/5 border-[#FDB813]/50" : "bg-gray-50 border-[#D1D5DB]"}`}>
                    {isEditing ? (
                      <div className="flex items-center gap-2 p-2">
                        <input type="text" value={editingBuiltInName} onChange={(e) => setEditingBuiltInName(e.target.value)}
                          className="flex-1 px-2 py-1 text-xs border border-[#FDB813] focus:outline-none" />
                        <input type="color" value={currentHex} onChange={(e) => handleBuiltInColor(key, e.target.value)}
                          className="w-6 h-6 rounded-full cursor-pointer border border-[#D1D5DB] p-0 shadow-sm hover:shadow [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0" />
                        <button onClick={handleSaveBuiltInName} className="px-2 py-1 text-[10px] font-semibold bg-[#FDB813] text-[#1A1A2E]">บันทึก</button>
                        <button onClick={() => { setEditingBuiltInKey(null); setEditingBuiltInName(""); }} className="px-2 py-1 text-[10px] border border-[#D1D5DB] text-[#6B7280]">ยกเลิก</button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-2">
                        <span className="flex items-center gap-2">
                          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentHex }} />
                          {eff.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setEditingBuiltInKey(key); setEditingBuiltInName(eff.label); }}
                            className="p-1 text-[#6B7280] hover:text-[#A31D1D] cursor-pointer transition-colors" title="แก้ไขชื่อและสี">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          {isOverridden && (
                            <button onClick={() => handleResetBuiltIn(key)} className="text-[9px] text-[#A31D1D] hover:underline" title="คืนค่าเริ่มต้น">
                              ↺
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Custom categories */}
              {customCategories.length > 0 && (
                <p className="text-[10px] font-semibold text-[#6B7280] uppercase mt-3 mb-1.5">กำหนดเอง</p>
              )}
              {customCategories.map((cat) => {
                const currentHex = cat.hex;
                return (
                <div key={cat.key} className={`text-xs p-2 border mb-1 ${editingCatKey === cat.key ? "bg-[#FDB813]/5 border-[#FDB813]" : "bg-white border-[#FDB813]/30"}`}>
                  {editingCatKey === cat.key ? (
                    <div className="flex items-center gap-2">
                      <input type="text" value={editingCatName} onChange={(e) => setEditingCatName(e.target.value)}
                        className="flex-1 px-2 py-1 text-xs border border-[#FDB813] focus:outline-none" />
                      <input type="color" value={currentHex} onChange={(e) => handleCustomColor(cat.key, e.target.value)}
                        className="w-6 h-6 rounded-full cursor-pointer border border-[#D1D5DB] p-0 shadow-sm hover:shadow [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0"
                        title="เลือกสี" />
                      <button onClick={handleSaveEditCategory} className="px-2 py-1 text-[10px] font-semibold bg-[#FDB813] text-[#1A1A2E]">บันทึก</button>
                      <button onClick={() => setEditingCatKey(null)} className="px-2 py-1 text-[10px] border border-[#D1D5DB] text-[#6B7280]">ยกเลิก</button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentHex }} />
                        {cat.label}
                      </span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEditCategory(cat.key)} className="p-1 text-[#6B7280] hover:text-[#A31D1D] cursor-pointer transition-colors" title="แก้ไขชื่อและสี">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDeleteCategory(cat.key)} className="p-1 text-red-400 hover:text-red-600 cursor-pointer transition-colors" title="ลบ">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                );
              })}
              {customCategories.length === 0 && (
                <p className="text-[10px] text-[#9CA3AF] text-center py-2">ยังไม่มีประเภทที่กำหนดเอง</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit/Add Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={closeEditModal}>
          <div className="bg-white border border-[#FDB813] shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <h4 className="text-sm font-semibold text-[#1A1A2E] mb-4">{editModal.editingId ? "✏️ แก้ไขกิจกรรม" : "➕ เพิ่มกิจกรรมใหม่"}</h4>
              <div className="space-y-3">
                <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">ชื่อกิจกรรม *</label><input type="text" value={editModal.title} onChange={(e) => updateField("title", e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30" placeholder="นัดประชุม..." /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">วันที่เริ่ม *</label><input type="date" value={editModal.date} onChange={(e) => updateField("date", e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30" /></div>
                  <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">วันที่สิ้นสุด</label><input type="date" value={editModal.endDate} onChange={(e) => updateField("endDate", e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30" /></div>
                  <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">เวลาเริ่ม</label><input type="time" value={editModal.time} onChange={(e) => updateField("time", e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30" /></div>
                  <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">เวลาสิ้นสุด</label><input type="time" value={editModal.endTime} onChange={(e) => updateField("endTime", e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">สถานที่</label>
                  <LocationSelect value={editModal.location} onChange={(v) => updateField("location", v)} /></div>
                  <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">ประเภท</label>
                  <CategorySelect value={editModal.category} onChange={(v) => updateField("category", v)} extras={customCategories} overrides={Object.fromEntries(Object.entries(categoryColorOverrides).map(([k, v]) => [k, { hex: v }]))} /></div>
                </div>
                <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">รายละเอียด</label><textarea value={editModal.description} onChange={(e) => updateField("description", e.target.value)} rows={2} className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30" placeholder="รายละเอียดเพิ่มเติม..." /></div>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button onClick={closeEditModal} className="px-4 py-2 text-sm font-medium border border-[#D1D5DB] text-[#6B7280] hover:bg-gray-100 hover:text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer transition-all">ยกเลิก</button>
                <button onClick={handleSubmit} disabled={!editModal.title || !editModal.date} className="px-5 py-2 text-sm font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800] shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#FDB813]/50 focus:ring-offset-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed">{editModal.editingId ? "บันทึกการแก้ไข" : "บันทึก"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white border border-red-300 p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div><h4 className="text-sm font-semibold text-[#1A1A2E]">ลบกิจกรรม</h4><p className="text-[11px] text-[#6B7280] mt-0.5">การกระทำนี้ไม่สามารถย้อนกลับได้</p></div>
            </div>
            <div className="p-3 bg-gray-50 border border-[#D1D5DB] mb-4">
              <p className="text-xs font-medium text-[#1A1A2E]">{deleteTarget.title}</p>
              <p className="text-[10px] text-[#6B7280] mt-0.5">{formatThaiDate(deleteTarget.date)}{deleteTarget.time && ` ${deleteTarget.time}`}{deleteTarget.endTime && `-${deleteTarget.endTime}`}</p>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm font-medium border border-[#D1D5DB] text-[#6B7280] hover:bg-gray-100 hover:text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer transition-all">ยกเลิก</button>
              <button onClick={confirmDelete} className="px-5 py-2 text-sm font-semibold bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 cursor-pointer transition-all">ลบกิจกรรม</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════════ */

export default function AdminAppsPage() {
  // ── Shared state (auto-syncs with application-hub) ──
  const {
    allApps,
    allCalendarEvents,
    allCategories,
    addApp,
    updateApp,
    removeApp,
    updateAppStatus,
    addCalendarEvent,
    updateCalendarEvent,
    removeCalendarEvent,
    updateCategoryColor,
    updateCategoryName,
    resetCategoryOverrides,
    addCustomCategory,
    removeCustomCategory,
    updateCustomCategoryColor,
  } = useAppHub();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-[#1A1A2E]">จัดการ Application</h1>
      <h2 className="text-base font-semibold text-[#A31D1D] mt-0.5">ผู้ดูแลระบบ</h2>
      <p className="text-sm text-[#6B7280] mt-1 max-w-3xl">
        เพิ่ม/แก้ไข/ลบ Application ที่ใช้งานผ่าน TULAW ONE PLATFORM พร้อมจัดการปฏิทินกิจกรรม
      </p>

      <AdminPanel
        appList={allApps}
        onAdd={addApp}
        onUpdate={updateApp}
        onRemove={removeApp}
        onUpdateAppStatus={updateAppStatus}
      />
      <CalendarManager
        events={allCalendarEvents}
        onAddEvent={addCalendarEvent}
        onUpdateEvent={updateCalendarEvent}
        onRemoveEvent={removeCalendarEvent}
      />
    </div>
  );
}
