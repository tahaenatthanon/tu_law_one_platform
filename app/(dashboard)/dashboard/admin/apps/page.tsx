"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ChevronDown, Check, MapPin, Settings, Pencil, ChevronRight, X, Plus, Trash2, Calendar, ShieldBan } from "lucide-react";
import {
  appCategories,
  type Application,
  type AppStatus,
  type SubApp,
  type CalendarEvent,
} from "@/lib/app-data";
import { useAppHub } from "@/lib/app-hub-context";

const ADMIN_ROLES = ["super_admin", "system_admin"];

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
        <ChevronDown className={`${isXs ? "w-2.5 h-2.5" : "w-3 h-3"} ml-0.5 opacity-50`} strokeWidth={2} />
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
                <Check className="w-3 h-3 ml-auto" strokeWidth={2.5} />
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
        <ChevronDown className="w-3 h-3 ml-auto opacity-50" strokeWidth={2} />
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
                <Check className="w-4 h-4 ml-auto" strokeWidth={2.5} />
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
        <MapPin className="w-4 h-4 shrink-0 text-[#9CA3AF]" strokeWidth={2} />
        <span className="truncate">{getLabel()}</span>
        <ChevronDown className="w-3 h-3 ml-auto opacity-50 shrink-0" strokeWidth={2} />
      </button>
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-[#D1D5DB] shadow-lg max-h-56 overflow-y-auto">
          <div className="px-2 pt-2 pb-1 border-b border-[#D1D5DB]">
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="ระบุสถานที่เอง..."
              autoComplete="off"
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
                <Check className="w-4 h-4 ml-auto shrink-0" strokeWidth={2.5} />
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
  appList, onAdd, onUpdate, onRemove, onUpdateAppStatus, onUpdateSubAppStatus,
  onAddSubApp, onUpdateSubApp, onRemoveSubApp,
}: {
  appList: Application[];
  onAdd: (app: Application) => void;
  onUpdate: (id: string, updates: Partial<Application>) => void;
  onRemove: (id: string) => void;
  onUpdateAppStatus: (id: string, status: AppStatus) => void;
  onUpdateSubAppStatus: (appId: string, subId: string, status: AppStatus) => void;
  onAddSubApp: (appId: string, subApp: SubApp) => void;
  onUpdateSubApp: (appId: string, subId: string, updates: Partial<SubApp>) => void;
  onRemoveSubApp: (appId: string, subId: string) => void;
}) {
  const [showStatusPanel, setShowStatusPanel] = useState(false);
  const [showEditInfoPanel, setShowEditInfoPanel] = useState(false);
  const [deleteAppTarget, setDeleteAppTarget] = useState<Application | null>(null);
  const [expandedApps, setExpandedApps] = useState<Set<string>>(new Set());
  /** รายการย่อยที่กำลังขยายใน edit info panel */
  const [expandedSubApps, setExpandedSubApps] = useState<Set<string>>(new Set());
  /** Modal สำหรับเพิ่ม/แก้ไขรายการย่อย */
  const [subAppForm, setSubAppForm] = useState<{
    appId: string;
    editingId: string | null;
    name: string;
    description: string;
    url: string;
    status: AppStatus;
  } | null>(null);

  const [editModal, setEditModal] = useState<{
    editingId: string | null;
    name: string; description: string; url: string;
    category: string; status: AppStatus;
  } | null>(null);

  const [pendingStatusChanges, setPendingStatusChanges] = useState<Map<string, AppStatus>>(new Map());

  const getEffectiveStatus = (id: string, fallback: AppStatus) =>
    pendingStatusChanges.get(id) ?? fallback;

  const setPendingStatus = (id: string, status: AppStatus) =>
    setPendingStatusChanges((prev) => {
      const next = new Map(prev);
      // ถ้าเปลี่ยนกลับไปเป็นค่าเดิม → ลบออกจาก pending (ไม่มีการเปลี่ยนแปลง)
      const entry = id.startsWith("sub:")
        ? appList.flatMap((a) => a.subApps).find((s) => `sub:${s.id}` === id)
        : appList.find((a) => a.id === id);
      const originalStatus = entry ? (id.startsWith("sub:") ? (entry as SubApp).status : (entry as Application).status) : undefined;
      if (originalStatus === status) {
        next.delete(id);
      } else {
        next.set(id, status);
      }
      return next;
    });

  const applyPendingStatusChanges = () => {
    pendingStatusChanges.forEach((status, key) => {
      if (key.startsWith("sub:")) {
        const subId = key.slice(4);
        for (const app of appList) {
          const sub = app.subApps.find((s) => s.id === subId);
          if (sub) {
            onUpdateSubAppStatus(app.id, subId, status);
            break;
          }
        }
      } else {
        onUpdateAppStatus(key, status);
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

  // ── Sub-app form handlers ──
  const openSubAppForm = (appId: string, sub?: SubApp) => {
    setSubAppForm({
      appId,
      editingId: sub?.id ?? null,
      name: sub?.name ?? "",
      description: sub?.description ?? "",
      url: sub?.url ?? "",
      status: sub?.status ?? "online",
    });
  };

  const closeSubAppForm = () => setSubAppForm(null);

  const handleSubAppSubmit = () => {
    if (!subAppForm || !subAppForm.name || !subAppForm.url) return;
    if (subAppForm.editingId) {
      onUpdateSubApp(subAppForm.appId, subAppForm.editingId, {
        name: subAppForm.name,
        description: subAppForm.description,
        url: subAppForm.url,
        status: subAppForm.status,
      });
    } else {
      onAddSubApp(subAppForm.appId, {
        id: `sub-${Date.now()}`,
        name: subAppForm.name,
        description: subAppForm.description,
        url: subAppForm.url,
        status: subAppForm.status,
      });
    }
    setSubAppForm(null);
  };

  const toggleSubAppExpanded = (appId: string) => {
    setExpandedSubApps((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) next.delete(appId);
      else next.add(appId);
      return next;
    });
  };

  return (
    <>
      <div className="bg-white border border-[#FDB813]/50 p-5 mt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#8B1515]" strokeWidth={2} />
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
              <Pencil className="w-4 h-4" strokeWidth={2} />
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
                      autoComplete="off"
                      className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30" placeholder="ระบบทะเบียนนักศึกษา" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1A1A2E] mb-1">URL *</label>
                    <input type="url" value={editModal.url} onChange={(e) => updateField("url", e.target.value)}
                      autoComplete="url"
                      className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1A1A2E] mb-1">คำอธิบาย</label>
                    <input type="text" value={editModal.description} onChange={(e) => updateField("description", e.target.value)}
                      autoComplete="off"
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
                <button onClick={handleSubmit} disabled={!editModal.name || !editModal.url} className="px-5 py-2 text-sm font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800] shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#FDB813]/50 focus:ring-offset-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed">บันทึก</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Panel Modal */}
        {showStatusPanel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowStatusPanel(false)}>
            <div className="bg-white border border-[#FDB813] shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 pb-3 border-b border-[#D1D5DB] shrink-0">
                <div>
                  <h3 className="text-sm font-semibold text-[#1A1A2E]">เปลี่ยนสถานะแอปพลิเคชัน</h3>
                  <p className="text-[10px] text-[#9CA3AF] mt-0.5">เลือกสถานะจาก dropdown — คลิก ▶ เพื่อดูรายการย่อย — กดบันทึกเพื่อยืนยัน</p>
                </div>
              </div>
              <div className="p-5 overflow-y-auto flex-1 space-y-2">
                {appList.map((app) => {
                  const pendingStatus = getEffectiveStatus(app.id, app.status);
                  const origStatus = app.status;
                  const appChanged = pendingStatusChanges.has(app.id);
                  const expanded = expandedApps.has(app.id);
                  const hasSubApps = app.subApps && app.subApps.length > 0;
                  return (
                    <div key={app.id} className={`border transition-colors ${appChanged ? "border-[#FDB813] bg-[#FDB813]/5" : "border-[#D1D5DB] bg-white"}`}>
                      {/* Parent App Row — click to expand */}
                      <div
                        className={`flex items-center justify-between gap-2 p-3 ${hasSubApps ? "cursor-pointer" : ""}`}
                        onClick={() => { if (hasSubApps) setExpandedApps((prev) => { const next = new Set(prev); if (next.has(app.id)) next.delete(app.id); else next.add(app.id); return next; }); }}
                      >
                        {/* Expand toggle */}
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {hasSubApps ? (
                            <span className="shrink-0 w-5 h-5 flex items-center justify-center text-[#6B7280]">
                              <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`} strokeWidth={2.5} />
                            </span>
                          ) : (
                            <span className="w-5 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <span className="text-sm font-semibold text-[#1A1A2E] block truncate">{app.name}</span>
                            <span className="text-[10px] text-[#6B7280]">
                              <span className={`inline-block w-1.5 h-1.5 rounded-full ${statusMap[origStatus].dot}`} /> {statusMap[origStatus].label}
                              {appChanged && <span className="ml-1 text-[#FDB813] font-medium">→ {statusMap[pendingStatus].label}</span>}
                            </span>
                          </div>
                        </div>
                        <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                          <StatusSelect value={pendingStatus} onChange={(v) => setPendingStatus(app.id, v)} />
                        </div>
                      </div>

                      {/* Sub Apps (expandable) */}
                      {hasSubApps && expanded && (
                        <div className="border-t border-[#D1D5DB] bg-gray-50/50">
                          {app.subApps.map((sub) => {
                            const subId = `sub:${sub.id}`;
                            const subPendingStatus = getEffectiveStatus(subId, sub.status);
                            const subOrigStatus = sub.status;
                            const subChanged = pendingStatusChanges.has(subId);
                            return (
                              <div key={sub.id} className={`flex items-center justify-between gap-2 px-4 py-2 border-b border-[#D1D5DB]/50 last:border-b-0 transition-colors ${subChanged ? "bg-[#FDB813]/5" : ""}`}>
                                <div className="min-w-0 flex-1 pl-1">
                                  <span className="text-xs font-medium text-[#1A1A2E] block truncate">{sub.name}</span>
                                  <span className="text-[9px] text-[#6B7280]">
                                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${statusMap[subOrigStatus].dot}`} /> {statusMap[subOrigStatus].label}
                                    {subChanged && <span className="ml-1 text-[#FDB813] font-medium">→ {statusMap[subPendingStatus].label}</span>}
                                  </span>
                                </div>
                                <StatusSelect value={subPendingStatus} onChange={(v) => setPendingStatus(subId, v)} size="xs" />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end gap-2 p-5 pt-3 border-t border-[#D1D5DB] shrink-0">
                <button onClick={() => { setShowStatusPanel(false); setPendingStatusChanges(new Map()); }} className="px-5 py-2.5 text-sm font-medium border border-[#D1D5DB] text-[#6B7280] hover:bg-gray-100 hover:text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer transition-all">ปิด</button>
                <button onClick={applyPendingStatusChanges} disabled={pendingStatusChanges.size === 0} className="px-5 py-2.5 text-sm font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800] shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#FDB813]/50 focus:ring-offset-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed">บันทึก</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Info Panel Modal */}
        {showEditInfoPanel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowEditInfoPanel(false)}>
            <div className="bg-white border border-[#FDB813] shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 pb-3 border-b border-[#D1D5DB] shrink-0">
                <div>
                  <h3 className="text-sm font-semibold text-[#1A1A2E]">แก้ไขข้อมูลแอปพลิเคชัน</h3>
                  <p className="text-[10px] text-[#9CA3AF] mt-0.5">คลิก ✏️ เพื่อแก้ไขชื่อ, URL, หมวดหมู่ — คลิก ▶ เพื่อดูรายการย่อย — คลิก 🗑️ เพื่อลบ</p>
                </div>
              </div>
              <div className="p-5 overflow-y-auto flex-1 space-y-2">
                {appList.map((app) => {
                  const isCustom = app.id.startsWith("custom-");
                  const expanded = expandedSubApps.has(app.id);
                  const hasSubApps = app.subApps && app.subApps.length > 0;
                  return (
                    <div key={app.id} className="border border-[#D1D5DB] bg-white">
                      {/* Parent App Row — click to expand */}
                      <div
                        className={`flex items-center justify-between gap-2 p-3 ${hasSubApps ? "cursor-pointer" : ""}`}
                        onClick={() => { if (hasSubApps) toggleSubAppExpanded(app.id); }}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {/* Expand toggle */}
                          <span className={`shrink-0 w-5 h-5 flex items-center justify-center ${hasSubApps ? "text-[#6B7280]" : "text-[#D1D5DB]"}`}>
                            <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`} strokeWidth={2.5} />
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-semibold text-[#1A1A2E] truncate">{app.name}</span>
                              {isCustom && (
                                <span className="text-[9px] px-1.5 py-0.5 bg-[#FDB813]/20 text-[#8B6914] rounded-full font-medium shrink-0">กำหนดเอง</span>
                              )}
                              {hasSubApps && (
                                <span className="text-[10px] text-[#9CA3AF] shrink-0">({app.subApps.length})</span>
                              )}
                            </div>
                            <p className="text-[10px] text-[#6B7280] line-clamp-1">{app.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => { e.stopPropagation(); setShowEditInfoPanel(false); openEditForm(app); }}
                            className="px-2.5 py-1 text-xs font-medium border border-[#D1D5DB] bg-white text-[#1A1A2E] hover:border-[#FDB813] hover:bg-[#FDB813]/10 focus:outline-none focus:ring-2 focus:ring-[#FDB813]/30 cursor-pointer transition-all"
                            title="แก้ไขชื่อ/URL/หมวดหมู่"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => { setShowEditInfoPanel(false); setDeleteAppTarget(app); }}
                            className="px-2.5 py-1 text-xs font-medium border border-red-200 bg-white text-red-500 hover:border-red-400 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300 cursor-pointer transition-all"
                            title="ลบแอปพลิเคชัน"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {/* Sub Apps (expandable) */}
                      {hasSubApps && expanded && (
                        <div className="border-t border-[#D1D5DB] bg-gray-50/50">
                          {app.subApps.map((sub) => (
                            <div key={sub.id} className="flex items-center justify-between gap-2 px-4 py-2 border-b border-[#D1D5DB]/50 last:border-b-0">
                              <div className="min-w-0 flex-1 pl-1">
                                <span className="text-xs font-medium text-[#1A1A2E] block truncate">{sub.name}</span>
                                <span className="text-[9px] text-[#9CA3AF] hidden sm:inline truncate">{sub.url}</span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setShowEditInfoPanel(false); openSubAppForm(app.id, sub); }}
                                  className="p-1.5 text-[#6B7280] hover:text-[#1A1A2E] hover:bg-[#FDB813]/10 cursor-pointer transition-colors"
                                  title="แก้ไขรายการย่อย"
                                >
                                  <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); if (confirm(`ลบ "${sub.name}"?`)) { onRemoveSubApp(app.id, sub.id); } }}
                                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                                  title="ลบรายการย่อย"
                                >
                                  <X className="w-3.5 h-3.5" strokeWidth={2} />
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={(e) => { e.stopPropagation(); openSubAppForm(app.id); }}
                            className="flex items-center gap-1 w-full text-[10px] text-[#A31D1D] hover:text-[#8B1515] hover:bg-[#FDB813]/10 font-medium py-2 px-4 cursor-pointer transition-colors"
                          >
                            <Plus className="w-3 h-3" strokeWidth={2} />
                            เพิ่มรายการย่อย
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
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
                    <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                  <button onClick={() => setDeleteAppTarget(app)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer transition-colors" title="ลบแอปพลิเคชัน">
                    <Trash2 className="w-4 h-4" strokeWidth={2} />
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
                <Trash2 className="w-5 h-5 text-red-600" strokeWidth={2} />
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

      {/* Sub-App Form Modal */}
      {subAppForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={closeSubAppForm}>
          <div className="bg-white border border-[#FDB813] shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <h4 className="text-sm font-semibold text-[#1A1A2E] mb-4">
                {subAppForm.editingId ? "✏️ แก้ไขรายการย่อย" : "➕ เพิ่มรายการย่อย"}
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#1A1A2E] mb-1">ชื่อ *</label>
                  <input type="text" value={subAppForm.name}
                    onChange={(e) => setSubAppForm({ ...subAppForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30" placeholder="ระบบรายงาน" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#1A1A2E] mb-1">URL *</label>
                  <input type="text" value={subAppForm.url}
                    onChange={(e) => setSubAppForm({ ...subAppForm, url: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#1A1A2E] mb-1">คำอธิบาย</label>
                  <input type="text" value={subAppForm.description}
                    onChange={(e) => setSubAppForm({ ...subAppForm, description: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30" placeholder="คำอธิบายสั้นๆ" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#1A1A2E] mb-1">สถานะ</label>
                  <StatusSelect value={subAppForm.status} onChange={(v) => setSubAppForm({ ...subAppForm, status: v })} />
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button onClick={closeSubAppForm} className="px-4 py-2 text-sm font-medium border border-[#D1D5DB] text-[#6B7280] hover:bg-gray-100 hover:text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer transition-all">ยกเลิก</button>
                <button onClick={handleSubAppSubmit} disabled={!subAppForm.name || !subAppForm.url} className="px-5 py-2 text-sm font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800] shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#FDB813]/50 focus:ring-offset-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed">บันทึก</button>
              </div>
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
          <Calendar className="w-4 h-4 text-[#8B1515]" strokeWidth={2} />
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
                    <Trash2 className="w-4 h-4" strokeWidth={2} />
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
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {/* Add new */}
              <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 border border-[#D1D5DB]">
                <input type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="ชื่อประเภทใหม่..."
                  autoComplete="off"
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
              {Object.entries(eventCategoryMap).map(([key]) => {
                const eff = allCategories[key];
                const isOverridden = !!(categoryColorOverrides[key] || categoryNameOverrides[key]);
                const currentHex = eff.hex;
                const isEditing = editingBuiltInKey === key;
                return (
                  <div key={key} className={`text-xs border mb-1 transition-colors ${isOverridden ? "bg-[#FDB813]/5 border-[#FDB813]/50" : "bg-gray-50 border-[#D1D5DB]"}`}>
                    {isEditing ? (
                      <div className="flex items-center gap-2 p-2">
                        <input type="text" value={editingBuiltInName} onChange={(e) => setEditingBuiltInName(e.target.value)}
                          autoComplete="off"
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
                            <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
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
                        autoComplete="off"
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
                          <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
                        </button>
                        <button onClick={() => handleDeleteCategory(cat.key)} className="p-1 text-red-400 hover:text-red-600 cursor-pointer transition-colors" title="ลบ">
                          <X className="w-3.5 h-3.5" strokeWidth={2} />
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
                <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">ชื่อกิจกรรม *</label><input type="text" value={editModal.title} onChange={(e) => updateField("title", e.target.value)} autoComplete="off" className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30" placeholder="นัดประชุม..." /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">วันที่เริ่ม *</label><input type="date" value={editModal.date} onChange={(e) => updateField("date", e.target.value)} autoComplete="off" className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30" /></div>
                  <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">วันที่สิ้นสุด</label><input type="date" value={editModal.endDate} onChange={(e) => updateField("endDate", e.target.value)} autoComplete="off" className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30" /></div>
                  <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">เวลาเริ่ม</label><input type="time" value={editModal.time} onChange={(e) => updateField("time", e.target.value)} autoComplete="off" className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30" /></div>
                  <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">เวลาสิ้นสุด</label><input type="time" value={editModal.endTime} onChange={(e) => updateField("endTime", e.target.value)} autoComplete="off" className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30" /></div>
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
                <button onClick={handleSubmit} disabled={!editModal.title || !editModal.date} className="px-5 py-2 text-sm font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800] shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#FDB813]/50 focus:ring-offset-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed">บันทึก</button>
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
                <Trash2 className="w-5 h-5 text-red-600" strokeWidth={2} />
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
  // ── Hooks (must be called before any early return) ──
  const { data: session } = useSession();
  const {
    allApps,
    allCalendarEvents,
    addApp,
    updateApp,
    removeApp,
    updateAppStatus,
    updateSubAppStatus,
    addSubApp,
    updateSubApp,
    removeSubApp,
    addCalendarEvent,
    updateCalendarEvent,
    removeCalendarEvent,
  } = useAppHub();

  // ── Role check ──
  const userRoles: string[] = (session?.user as Record<string, unknown>)?.roles as string[] ?? [];
  const isAdmin = userRoles.some((r) => ADMIN_ROLES.includes(r));

  if (!isAdmin) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#FCE4E8] rounded-full flex items-center justify-center">
            <ShieldBan className="w-8 h-8 text-[#A31D1D]" strokeWidth={2} />
          </div>
          <h2 className="text-lg font-semibold text-[#1A1A2E] mb-1">ไม่มีสิทธิ์เข้าถึง</h2>
          <p className="text-sm text-[#6B7280]">คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบ</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-0 px-6 pb-8">
      <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">จัดการ Application</h1>
      <p className="text-sm text-[#6B7280] mb-6">เพิ่ม/แก้ไข/ลบ Application ที่ใช้งานผ่าน TULAW ONE PLATFORM พร้อมจัดการปฏิทินกิจกรรม</p>

      <AdminPanel
        appList={allApps}
        onAdd={addApp}
        onUpdate={updateApp}
        onRemove={removeApp}
        onUpdateAppStatus={updateAppStatus}
        onUpdateSubAppStatus={updateSubAppStatus}
        onAddSubApp={addSubApp}
        onUpdateSubApp={updateSubApp}
        onRemoveSubApp={removeSubApp}
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
