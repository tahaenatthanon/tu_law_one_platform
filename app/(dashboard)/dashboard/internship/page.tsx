"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import RequireRole from "@/components/shared/require-role";
import { X } from "lucide-react";

type Company = { id: string; name: string; address?: string; contactName?: string; contactPhone?: string; contactEmail?: string; position?: string; quota?: number };
type Report = { id: string; company: Company; startDate: string; endDate: string; reportTitle: string; reportContent?: string; advisorComment?: string; grade?: string; status: string; createdAt: string };

export default function InternshipPage() {
  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as any)?.roles ?? [];
  const canCreate = userRoles.some((r: string) => ["super_admin","system_admin","dean","dept_admin","user"].includes(r));
  const [tab, setTab] = useState<"companies" | "reports">("companies");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [message, setMessage] = useState("");

  // Report form
  const [companyId, setCompanyId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportTitle, setReportTitle] = useState("");
  const [reportContent, setReportContent] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const type = tab === "companies" ? "companies" : "reports";
      const res = await fetch(`/api/internship?type=${type}`);
      const json = await res.json();
      if (json.success) {
        if (tab === "companies") setCompanies(json.data);
        else setReports(json.data);
      }
    } catch { }
    setLoading(false);
  }, [tab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmitReport = async () => {
    if (!companyId || !startDate || !endDate || !reportTitle) { setMessage("กรุณากรอกข้อมูลให้ครบถ้วน"); return; }
    setSubmitLoading(true); setMessage("");
    try {
      const res = await fetch("/api/internship", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, startDate, endDate, reportTitle, reportContent }),
      });
      const json = await res.json();
      if (json.success) { setMessage("ส่งรายงานสำเร็จ"); setShowReportForm(false); setTab("reports"); }
      else setMessage(json.error?.message ?? "เกิดข้อผิดพลาด");
    } catch { setMessage("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์"); }
    setSubmitLoading(false);
  };

  const statusLabel = (s: string) => ({ draft: "ฉบับร่าง", submitted: "ส่งแล้ว", approved: "อนุมัติแล้ว", rejected: "ไม่อนุมัติ" }[s] ?? s);

  const renderContent = () => {
    if (loading) return <p className="text-[#9CA3AF]">กำลังโหลด...</p>;
    if (tab === "companies") {
      if (companies.length === 0) return <div className="text-center py-16 text-[#9CA3AF]"><p className="text-sm">ไม่มีข้อมูลสถานประกอบการ</p></div>;
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {companies.map(c => (
            <div key={c.id} onClick={() => setSelectedCompany(c)} className="bg-white border border-[#D1D5DB] p-4 hover:border-[#FDB813] cursor-pointer transition-colors">
              <h3 className="font-semibold text-[#1A1A2E]">{c.name}</h3>
              {c.position && <p className="text-sm text-[#A31D1D] mt-0.5">ตำแหน่ง: {c.position}</p>}
              {c.address && <p className="text-xs text-[#6B7280] mt-1">{c.address}</p>}
              <div className="flex gap-4 mt-2 text-xs text-[#9CA3AF]">
                {c.contactName && <span>👤 {c.contactName}</span>}
                {c.contactPhone && <span>📞 {c.contactPhone}</span>}
                {c.quota && <span>📋 รับ {c.quota} คน</span>}
              </div>
            </div>
          ))}
        </div>
      );
    }
    if (reports.length === 0) return <div className="text-center py-16 text-[#9CA3AF]"><p className="text-sm">ไม่มีรายงานฝึกงาน</p></div>;
    return (
      <div className="space-y-3">
        {reports.map(r => (
          <div key={r.id} className="bg-white border border-[#D1D5DB] p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-[#1A1A2E]">{r.reportTitle}</h3>
                <p className="text-sm text-[#6B7280] mt-0.5">{r.company?.name}</p>
                <p className="text-xs text-[#9CA3AF] mt-1">{new Date(r.startDate).toLocaleDateString("th-TH")} — {new Date(r.endDate).toLocaleDateString("th-TH")}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 font-medium ${r.status === "approved" ? "bg-green-100 text-green-700" : r.status === "submitted" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>{statusLabel(r.status)}</span>
            </div>
            {r.grade && <p className="text-sm font-bold text-[#A31D1D] mt-2">เกรด: {r.grade}</p>}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="pt-0 px-6 pb-8">
      <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">ระบบฝึกงาน</h1>
      <p className="text-sm text-[#6B7280] mb-6">รายชื่อสถานประกอบการและรายงานผลฝึกงาน</p>

      <div className="flex gap-2 mb-4">
        {(["companies", "reports"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${tab === t ? "bg-[#8B1515] text-white" : "bg-white text-[#6B7280] border border-[#D1D5DB] hover:border-[#FDB813]"}`}>
            {t === "companies" ? "🏢 รายชื่อสถานประกอบการ" : "📝 รายงานผลฝึกงาน"}
          </button>
        ))}
        <button onClick={() => setShowReportForm(true)}
          className="ml-auto px-4 py-2 text-sm font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800]">+ ส่งรายงาน</button>
      </div>

      {message && <div className={`p-3 mb-4 text-sm ${message.includes("สำเร็จ") ? "bg-green-50 border border-green-300 text-green-700" : "bg-[#FCE4E8] border border-[#A31D1D] text-[#A31D1D]"}`}>{message}</div>}

      {renderContent()}

      {/* Company Detail Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setSelectedCompany(null)}>
          <div className="bg-white border border-[#FDB813] p-6 w-full max-w-lg mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-[#1A1A2E]">{selectedCompany.name}</h3><button onClick={() => setSelectedCompany(null)} className="text-[#9CA3AF] hover:text-[#1A1A2E]"><X className="w-5 h-5" strokeWidth={2} /></button></div>
            <div className="space-y-2 text-sm">
              {selectedCompany.position && <div><span className="text-[#6B7280]">ตำแหน่ง:</span> {selectedCompany.position}</div>}
              {selectedCompany.address && <div><span className="text-[#6B7280]">ที่อยู่:</span> {selectedCompany.address}</div>}
              {selectedCompany.contactName && <div><span className="text-[#6B7280]">ผู้ติดต่อ:</span> {selectedCompany.contactName}</div>}
              {selectedCompany.contactPhone && <div><span className="text-[#6B7280]">โทรศัพท์:</span> {selectedCompany.contactPhone}</div>}
              {selectedCompany.contactEmail && <div><span className="text-[#6B7280]">อีเมล:</span> {selectedCompany.contactEmail}</div>}
              {selectedCompany.quota && <div><span className="text-[#6B7280]">จำนวนรับ:</span> {selectedCompany.quota} คน</div>}
            </div>
          </div>
        </div>
      )}

      {/* Report Form Modal */}
      {showReportForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowReportForm(false)}>
          <div className="bg-white border border-[#FDB813] p-6 w-full max-w-lg mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">ส่งรายงานผลฝึกงาน</h3>
            <div className="mb-3"><label className="block text-xs font-medium text-[#1A1A2E] mb-1">รหัสสถานประกอบการ</label><input type="text" value={companyId} onChange={e => setCompanyId(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813]" /></div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">วันที่เริ่ม</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB]" /></div>
              <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">วันที่สิ้นสุด</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB]" /></div>
            </div>
            <div className="mb-3"><label className="block text-xs font-medium text-[#1A1A2E] mb-1">หัวข้อรายงาน</label><input type="text" value={reportTitle} onChange={e => setReportTitle(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813]" /></div>
            <div className="mb-4"><label className="block text-xs font-medium text-[#1A1A2E] mb-1">เนื้อหารายงาน</label><textarea value={reportContent} onChange={e => setReportContent(e.target.value)} rows={4} className="w-full px-3 py-2 text-sm border border-[#D1D5DB]" /></div>
            <div className="flex gap-2">
              <button onClick={() => setShowReportForm(false)} className="flex-1 px-4 py-2.5 text-sm font-medium border border-[#D1D5DB] text-[#6B7280] hover:bg-gray-100">ยกเลิก</button>
              <button onClick={handleSubmitReport} disabled={submitLoading}
                className="flex-1 px-4 py-2.5 text-sm font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800] disabled:opacity-50">{submitLoading ? "กำลังส่ง..." : "ส่งรายงาน"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
