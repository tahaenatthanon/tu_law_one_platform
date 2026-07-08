"use client";

import { useState, useEffect } from "react";
import RequireRole from "@/components/shared/require-role";
import { useSession } from "next-auth/react";

const STATUS_CLASS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700", approved: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700",
};

export default function EofficeWorkflowPage() {
  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as Record<string, unknown>)?.roles as string[] ?? [];
  const isAdmin = userRoles.some((r) => ["super_admin", "system_admin"].includes(r));

  const [tab, setTab] = useState<"instances" | "templates">("instances");
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [instances, setInstances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/eoffice/workflow").then(r => r.json()),
      fetch("/api/eoffice/workflow?type=instances").then(r => r.json()),
    ])
      .then(([wf, inst]) => {
        if (wf.success) setWorkflows(wf.data);
        if (inst.success) setInstances(inst.data);
        if (!wf.success && !inst.success) setError("ไม่สามารถโหลดข้อมูลได้");
      })
      .catch(() => setError("ไม่สามารถโหลดข้อมูลได้"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-4 bg-gray-200 rounded w-1/3"/><div className="h-6 bg-gray-100 rounded"/></div></div>;
  if (error) return <div className="p-8 text-center"><div className="bg-[#FCE4E8] border border-[#A31D1D] p-4"><p className="text-sm text-[#A31D1D]">{error}</p></div></div>;

  return (
    <RequireRole roles={["super_admin", "system_admin", "dean", "dept_admin", "user", "viewer"]}>
      <div className="pt-0 px-6 pb-8">
        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">Workflow อนุมัติ</h1>
        <p className="text-sm text-[#6B7280] mb-6">กำหนดขั้นตอนการอนุมัติและติดตามสถานะคำขอ</p>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#F5F5F5] p-1 rounded mb-6 w-fit">
          {[
            { key: "instances" as const, label: "📋 รายการอนุมัติ" },
            ...(isAdmin ? [{ key: "templates" as const, label: "⚙️ ตั้งค่า Workflow" }] : []),
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${tab === t.key ? "bg-[#FDB813] text-[#1A1A2E] shadow-sm" : "text-[#6B7280] hover:text-[#1A1A2E]"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "instances" && (
          <div className="space-y-4">
            {instances.map((inst: any) => (
              <div key={inst.id} className="bg-white border border-[#D1D5DB] p-4 hover:border-[#FDB813] transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-[#1A1A2E]">{inst.entityName}</h3>
                    <p className="text-xs text-[#6B7280]">{inst.workflowName} · {inst.createdAt}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_CLASS[inst.status] ?? ""}`}>
                    {inst.status === "pending" ? "รออนุมัติ" : inst.status === "approved" ? "อนุมัติแล้ว" : "ปฏิเสธ"}
                  </span>
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-2 mt-3">
                  {Array.from({ length: inst.totalSteps }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        i + 1 < inst.currentStep ? "bg-green-100 text-green-700 border-2 border-green-500" :
                        i + 1 === inst.currentStep ? "bg-[#FDB813] text-[#1A1A2E] border-2 border-[#FDB813]" :
                        "bg-gray-100 text-[#9CA3AF] border-2 border-[#D1D5DB]"
                      }`}>
                        {i + 1 < inst.currentStep ? "✓" : i + 1}
                      </div>
                      {i < inst.totalSteps - 1 && (
                        <div className={`w-8 h-0.5 ${i + 1 < inst.currentStep ? "bg-green-500" : "bg-[#D1D5DB]"}`} />
                      )}
                    </div>
                  ))}
                  <span className="text-xs text-[#6B7280] ml-2">
                    ขั้นตอนที่ {inst.currentStep} จาก {inst.totalSteps}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "templates" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflows.map((wf: any) => (
              <div key={wf.id} className="bg-white border border-[#D1D5DB] p-4 hover:border-[#FDB813] transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-[#1A1A2E]">{wf.name}</h3>
                    <p className="text-xs text-[#9CA3AF]">{wf.entityType} · {wf.stepCount} ขั้นตอน</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 ${wf.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {wf.isActive ? "เปิดใช้งาน" : "ปิด"}
                  </span>
                </div>
                {/* Steps preview */}
                <div className="flex items-center gap-1 mt-3">
                  {Array.from({ length: wf.stepCount }).map((_, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div className="w-7 h-7 rounded-full bg-[#F5F5F5] border border-[#D1D5DB] flex items-center justify-center text-xs text-[#6B7280]">{i + 1}</div>
                      {i < wf.stepCount - 1 && <div className="w-4 h-0.5 bg-[#D1D5DB]" />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RequireRole>
  );
}
