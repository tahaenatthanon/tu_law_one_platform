"use client";

import { useState, useEffect } from "react";
import RequireRole from "@/components/shared/require-role";

type Version = { id: string; versionNumber: string; documentName: string; fileName: string; fileSize: number; uploadedBy: string; uploadedAt: string; changeLog: string };

const FMT = (n: number) => {
  if (n >= 1073741824) return (n / 1073741824).toFixed(1) + " GB";
  if (n >= 1048576) return (n / 1048576).toFixed(1) + " MB";
  if (n >= 1024) return (n / 1024).toFixed(1) + " KB";
  return n + " B";
};

export default function StorageVersionPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [docFilter, setDocFilter] = useState("");

  useEffect(() => {
    fetch("/api/storage")
      .then(function(r) { return r.json(); })
      .then(function(json) { if (json.success) setData(json.data); else setError(json.error?.message || "Error"); })
      .catch(function() { setError("ไม่สามารถโหลดข้อมูลได้"); })
      .finally(function() { setLoading(false); });
  }, []);

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-4 bg-gray-200 rounded w-1/3"/><div className="h-6 bg-gray-100 rounded"/></div></div>;
  if (error) return <div className="p-8 text-center"><div className="bg-[#FCE4E8] border border-[#A31D1D] p-4"><p className="text-sm text-[#A31D1D]">{error}</p></div></div>;

  const documents = [...new Set(data.map((v) => v.documentName))];
  const filtered = data.filter((v) => !docFilter || v.documentName === docFilter);

  return (
    <RequireRole roles={["super_admin", "system_admin", "dean", "dept_admin", "user", "viewer"]}>
      <div className="pt-0 px-6 pb-8">
        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">Version</h1>
        <p className="text-sm text-[#6B7280] mb-6">ประวัติการแก้ไขเอกสาร — ย้อนเวอร์ชันและดูการเปลี่ยนแปลง</p>

        <div className="flex gap-2 mb-6 flex-wrap">
          <button onClick={() => setDocFilter("")}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${!docFilter ? "bg-[#8B1515] text-white" : "bg-white text-[#6B7280] border border-[#D1D5DB] hover:border-[#FDB813]"}`}>
            เอกสารทั้งหมด
          </button>
          {documents.map((d) => (
            <button key={d} onClick={() => setDocFilter(d)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors truncate max-w-xs ${docFilter === d ? "bg-[#8B1515] text-white" : "bg-white text-[#6B7280] border border-[#D1D5DB] hover:border-[#FDB813]"}`}>
              {d}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="space-y-0">
          {filtered.map((v, i) => {
            const verNum = parseInt(v.versionNumber.replace("v", ""));
            const isLatest = i === 0 || filtered[i - 1]?.documentName !== v.documentName;
            return (
              <div key={v.id}>
                {isLatest && (
                  <h3 className="text-sm font-bold text-[#8B1515] mt-6 mb-3 first:mt-0">{v.documentName}</h3>
                )}
                <div className="flex gap-4">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full border-2 ${i === 0 ? "bg-[#FDB813] border-[#FDB813]" : "bg-white border-[#D1D5DB]"}`} />
                    <div className="w-0.5 flex-1 bg-[#D1D5DB] min-h-[60px]" />
                  </div>
                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-[#1A1A2E]">{v.versionNumber}</span>
                      <span className="text-xs px-1.5 py-0.5 bg-[#F5F5F5] text-[#6B7280]">{FMT(v.fileSize)}</span>
                      {i === 0 && <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700">ล่าสุด</span>}
                    </div>
                    <p className="text-xs text-[#6B7280] mb-1">{v.uploadedBy} · {v.uploadedAt}</p>
                    <p className="text-sm text-[#1A1A2E] bg-[#F5F5F5] p-2 border border-[#D1D5DB]">{v.changeLog}</p>
                    <button className="mt-2 text-xs text-[#A31D1D] hover:underline">⬇️ ดาวน์โหลดเวอร์ชันนี้</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </RequireRole>
  );
}
