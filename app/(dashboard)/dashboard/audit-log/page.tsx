"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Search, Filter, Download, Shield, RefreshCw,
  ChevronLeft, ChevronRight, X, FileText,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════ */

interface AuditLogEntry {
  id: string;
  userId: string | null;
  module: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  oldValue: string | null;
  newValue: string | null;
  ipAddress: string | null;
  browser: string | null;
  isSuccess: boolean;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstNameTh: string;
    lastNameTh: string;
  } | null;
}

interface AuditLogResponse {
  success: boolean;
  data: AuditLogEntry[];
  meta: { total: number; page: number; limit: number };
  error?: { code: string; message: string };
}

/* ═══════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════ */

const EVENT_TYPES = [
  "DOC_UPLOAD", "CONFIG_UPDATE", "PROJECT_APPROVE", "AD_SYNC",
  "USER_LOGIN", "USER_LOGIN_FAILED", "DASHBOARD_VIEW", "ROLE_CREATE",
];

const MODULES = [
  "auth", "documents", "projects", "config", "users", "dashboard",
];

const EVENT_LABELS: Record<string, string> = {
  DOC_UPLOAD: "อัปโหลดเอกสาร",
  CONFIG_UPDATE: "แก้ไขตั้งค่าระบบ",
  PROJECT_APPROVE: "อนุมัติโครงการ",
  AD_SYNC: "ซิงค์ Active Directory",
  USER_LOGIN: "เข้าสู่ระบบ",
  USER_LOGIN_FAILED: "เข้าสู่ระบบล้มเหลว",
  DASHBOARD_VIEW: "ดู Dashboard",
  ROLE_CREATE: "สร้างบทบาท",
};

const EVENT_COLORS: Record<string, string> = {
  USER_LOGIN: "#28A745",
  USER_LOGIN_FAILED: "#A31D1D",
  DOC_UPLOAD: "#4A90D9",
  CONFIG_UPDATE: "#FDB813",
  PROJECT_APPROVE: "#059669",
  AD_SYNC: "#8B5CF6",
  DASHBOARD_VIEW: "#6B7280",
  ROLE_CREATE: "#F97316",
};

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("th-TH", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function formatModule(m: string): string {
  const map: Record<string, string> = {
    auth: "Authentication", documents: "เอกสาร", projects: "โครงการ",
    config: "ตั้งค่าระบบ", users: "ผู้ใช้งาน", dashboard: "Dashboard",
  };
  return map[m] ?? m;
}

/* ═══════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════ */

export default function AuditLogPage() {
  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as Record<string, unknown>)?.roles as string[] ?? [];
  const isAdmin = userRoles.some((r) => ["super_admin", "system_admin"].includes(r));

  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterModule, setFilterModule] = useState("");
  const [filterUserId, setFilterUserId] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (filterAction) params.set("action", filterAction);
      if (filterModule) params.set("module", filterModule);
      if (filterUserId) params.set("userId", filterUserId);
      if (filterStartDate) params.set("startDate", filterStartDate);
      if (filterEndDate) params.set("endDate", filterEndDate);

      const res = await fetch(`/api/audit-log?${params.toString()}`);
      const json: AuditLogResponse = await res.json();
      if (!json.success) {
        setError(json.error?.message ?? "เกิดข้อผิดพลาด");
        return;
      }
      setLogs(json.data);
      setTotal(json.meta.total);
    } catch {
      setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  }, [page, limit, filterAction, filterModule, filterUserId, filterStartDate, filterEndDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  function exportCSV() {
    const headers = ["วันเวลา", "ผู้ใช้", "อีเมล", "โมดูล", "การกระทำ", "รายละเอียด", "IP Address", "สถานะ"];
    const rows = logs.map((l) => [
      formatDate(l.createdAt),
      l.user ? `${l.user.firstNameTh} ${l.user.lastNameTh}` : "ไม่ระบุ",
      l.user?.email ?? "-",
      formatModule(l.module),
      EVENT_LABELS[l.action] ?? l.action,
      l.oldValue ?? l.newValue ?? "-",
      l.ipAddress ?? "-",
      l.isSuccess ? "สำเร็จ" : "ล้มเหลว",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalPages = Math.ceil(total / limit);
  const hasFilters = filterAction || filterModule || filterUserId || filterStartDate || filterEndDate;

  /* ─── Not Authorized ─── */
  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Shield className="w-16 h-16 text-[#9CA3AF] mb-4" />
          <h2 className="text-lg font-semibold text-[#1A1A2E] mb-2">ไม่มีสิทธิ์เข้าถึง</h2>
          <p className="text-sm text-[#6B7280]">เฉพาะ Super Admin และ System Admin เท่านั้นที่สามารถดู Audit Log ได้</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-0 px-6 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">บันทึกความปลอดภัย (Audit Log)</h1>
            <p className="text-sm text-[#6B7280]">บันทึกกิจกรรมทั้งหมดในระบบ — ไม่สามารถแก้ไขหรือลบได้ (Immutable)</p>
          </div>
          <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            disabled={logs.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-[#FDB813] text-[#1A1A2E] rounded-md hover:brightness-95 active:brightness-90 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 px-4 py-2 border border-[#D1D5DB] text-[#1A1A2E] rounded-md hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            รีเฟรช
          </button>
        </div>
      </div>

      {/* ─── Search & Filter Bar ─── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="ค้นหาจากชื่อผู้ใช้, อีเมล, IP Address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#D1D5DB] bg-white text-[#1A1A2E] placeholder:text-gray-400 rounded-md focus:border-[#A31D1D] focus:ring-1 focus:ring-[#A31D1D] text-sm"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-md transition-colors duration-200 text-sm font-medium ${
            hasFilters
              ? "bg-[#FFF3CD] border-[#FDB813] text-[#1A1A2E]"
              : "border-[#D1D5DB] text-[#1A1A2E] hover:bg-gray-50"
          }`}
        >
          <Filter className="w-4 h-4" />
          ตัวกรอง
          {hasFilters && (
            <span className="bg-[#FDB813] text-[#1A1A2E] text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              !
            </span>
          )}
        </button>
      </div>

      {/* ─── Filter Panel ─── */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg">
          <div>
            <label className="block text-xs font-semibold text-[#6B7280] mb-1">ประเภทเหตุการณ์</label>
            <select
              value={filterAction}
              onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
              className="w-full border border-[#D1D5DB] bg-white text-[#1A1A2E] rounded-md focus:border-[#A31D1D] focus:ring-1 focus:ring-[#A31D1D] text-sm py-2 px-3"
            >
              <option value="">ทั้งหมด</option>
              {EVENT_TYPES.map((et) => (
                <option key={et} value={et}>{EVENT_LABELS[et] ?? et}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B7280] mb-1">โมดูล</label>
            <select
              value={filterModule}
              onChange={(e) => { setFilterModule(e.target.value); setPage(1); }}
              className="w-full border border-[#D1D5DB] bg-white text-[#1A1A2E] rounded-md focus:border-[#A31D1D] focus:ring-1 focus:ring-[#A31D1D] text-sm py-2 px-3"
            >
              <option value="">ทั้งหมด</option>
              {MODULES.map((m) => (
                <option key={m} value={m}>{formatModule(m)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B7280] mb-1">วันที่เริ่มต้น</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => { setFilterStartDate(e.target.value); setPage(1); }}
              className="w-full border border-[#D1D5DB] bg-white text-[#1A1A2E] rounded-md focus:border-[#A31D1D] focus:ring-1 focus:ring-[#A31D1D] text-sm py-2 px-3"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B7280] mb-1">วันที่สิ้นสุด</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => { setFilterEndDate(e.target.value); setPage(1); }}
              className="w-full border border-[#D1D5DB] bg-white text-[#1A1A2E] rounded-md focus:border-[#A31D1D] focus:ring-1 focus:ring-[#A31D1D] text-sm py-2 px-3"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
            <button
              onClick={() => {
                setFilterAction(""); setFilterModule(""); setFilterUserId("");
                setFilterStartDate(""); setFilterEndDate(""); setPage(1);
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-[#6B7280] hover:text-[#A31D1D] transition-colors"
            >
              <X className="w-3 h-3" />
              ล้างตัวกรอง
            </button>
          </div>
        </div>
      )}

      {/* ─── Stats Summary ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "รายการทั้งหมด", value: total, color: "#1A1A2E" },
          { label: "เข้าสู่ระบบสำเร็จ", value: logs.filter((l) => l.action === "USER_LOGIN" && l.isSuccess).length, color: "#28A745" },
          { label: "เข้าสู่ระบบล้มเหลว", value: logs.filter((l) => l.action === "USER_LOGIN_FAILED").length, color: "#A31D1D" },
          { label: "การเปลี่ยนแปลง", value: logs.filter((l) => !["USER_LOGIN", "USER_LOGIN_FAILED", "DASHBOARD_VIEW"].includes(l.action)).length, color: "#FDB813" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-[#D1D5DB] rounded-lg p-4">
            <p className="text-xs text-[#6B7280]">{stat.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: stat.color }}>
              {loading ? "-" : stat.value.toLocaleString("th-TH")}
            </p>
          </div>
        ))}
      </div>

      {/* ─── Table ─── */}
      <div className="bg-white border border-[#D1D5DB] rounded-lg overflow-hidden">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin h-8 w-8 border-4 border-[#8B1515] border-t-transparent rounded-full" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-12 h-12 text-[#9CA3AF] mb-3" />
            <p className="text-sm text-[#A31D1D]">{error}</p>
            <button onClick={fetchLogs} className="mt-3 text-sm text-[#4A90D9] hover:underline">ลองอีกครั้ง</button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && logs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Shield className="w-12 h-12 text-[#9CA3AF] mb-3" />
            <p className="text-sm text-[#1A1A2E] font-medium">ไม่พบรายการ Audit Log</p>
            <p className="text-xs text-[#6B7280] mt-1">ลองปรับตัวกรองหรือช่วงวันที่</p>
          </div>
        )}

        {/* Data */}
        {!loading && !error && logs.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F5F5F5] border-b border-[#E5E7EB]">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280]">วันเวลา</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280]">ผู้ใช้</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280]">โมดูล</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280]">การกระทำ</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280]">รายละเอียด</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280]">IP Address</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-[#6B7280]">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-4 py-3 text-xs text-[#6B7280] whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {log.user ? (
                        <div>
                          <p className="text-sm text-[#1A1A2E] font-medium">
                            {log.user.firstNameTh} {log.user.lastNameTh}
                          </p>
                          <p className="text-xs text-[#9CA3AF]">{log.user.email}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-[#9CA3AF]">ไม่ระบุ</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-[#F5F5F5] text-[#1A1A2E] px-2 py-0.5 rounded">
                        {formatModule(log.module)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: EVENT_COLORS[log.action] ?? "#6B7280" }}
                        />
                        <span className="text-sm text-[#1A1A2E]">
                          {EVENT_LABELS[log.action] ?? log.action}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-xs text-[#6B7280] truncate" title={log.oldValue ?? log.newValue ?? ""}>
                        {log.oldValue ?? log.newValue ?? "-"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-[#F5F5F5] px-1.5 py-0.5 rounded text-[#6B7280]">
                        {log.ipAddress ?? "-"}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        log.isSuccess
                          ? "bg-[#D4EDDA] text-[#28A745]"
                          : "bg-[#FCE4E8] text-[#A31D1D]"
                      }`}>
                        {log.isSuccess ? "สำเร็จ" : "ล้มเหลว"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5E7EB] bg-[#FAFAFA]">
            <p className="text-xs text-[#6B7280]">
              แสดง {(page - 1) * limit + 1} - {Math.min(page * limit, total)} จาก {total.toLocaleString("th-TH")} รายการ
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded border border-[#D1D5DB] disabled:opacity-30 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (page <= 4) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = page - 3 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 text-xs rounded transition-colors ${
                      pageNum === page
                        ? "bg-[#FDB813] text-[#1A1A2E] font-bold"
                        : "hover:bg-gray-100 text-[#1A1A2E]"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded border border-[#D1D5DB] disabled:opacity-30 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Immutable Notice ─── */}
      <div className="flex items-start gap-3 p-4 bg-[#FFF3CD] border border-[#FDB813] rounded-lg">
        <Shield className="w-5 h-5 text-[#E5A800] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-[#1A1A2E]">บันทึกความปลอดภัยแบบ Immutable</p>
          <p className="text-xs text-[#6B7280] mt-0.5">
            ข้อมูลทั้งหมดไม่สามารถแก้ไขหรือลบได้ ไม่ว่าจะเป็นผู้ใช้ระดับใดรวมถึง Super Admin — เป็นไปตามข้อกำหนด TOR §2.1.9
          </p>
        </div>
      </div>
    </div>
  );
}
