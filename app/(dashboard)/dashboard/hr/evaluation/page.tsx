"use client";

import { useState, useEffect } from "react";
import RequireRole from "@/components/shared/require-role";

type Evaluation = { id: string; evaluateeName: string; department: string; formName: string; year: number; period: string; totalScore: number; maxScore: number; comment: string; status: string; evaluatorName: string };

const STATUS_CLASS: Record<string, string> = { draft: "bg-gray-100 text-gray-600", completed: "bg-green-100 text-green-700", reviewed: "bg-blue-100 text-blue-700" };

export default function HrEvaluationPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Evaluation | null>(null);

  useEffect(() => {
    fetch("/api/hr/evaluation")
      .then(function(r) { return r.json(); })
      .then(function(json) { if (json.success) setData(json.data); else setError(json.error?.message || "Error"); })
      .catch(function() { setError("ไม่สามารถโหลดข้อมูลได้"); })
      .finally(function() { setLoading(false); });
  }, []);

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-4 bg-gray-200 rounded w-1/3"/><div className="h-6 bg-gray-100 rounded"/></div></div>;
  if (error) return <div className="p-8 text-center"><div className="bg-[#FCE4E8] border border-[#A31D1D] p-4"><p className="text-sm text-[#A31D1D]">{error}</p></div></div>;

  return (
    <RequireRole roles={["super_admin", "system_admin", "dean", "dept_admin", "user", "viewer"]}>
      <div className="pt-0 px-6 pb-8">
        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">ประเมินผล</h1>
        <p className="text-sm text-[#6B7280] mb-6">ประเมินผลการปฏิบัติงานประจำปี</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            {data.map((ev) => (
              <button key={ev.id} onClick={() => setSelected(selected?.id === ev.id ? null : ev)}
                className={`w-full text-left p-3 border ${selected?.id === ev.id ? "border-[#FDB813] bg-[#FEF9E7]" : "border-[#D1D5DB] bg-white hover:border-[#FDB813]"}`}>
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-semibold text-[#1A1A2E]">{ev.evaluateeName}</h3>
                  <span className={`text-xs px-1.5 py-0.5 ${STATUS_CLASS[ev.status] ?? ""}`}>{ev.status === "draft" ? "ร่าง" : "เสร็จ"}</span>
                </div>
                <p className="text-xs text-[#9CA3AF]">{ev.department} · {ev.formName}</p>
                {ev.status === "completed" && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 h-2">
                      <div className={`h-2 ${ev.totalScore >= 80 ? "bg-green-500" : ev.totalScore >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                        style={{ width: `${(ev.totalScore / ev.maxScore) * 100}%` }} />
                    </div>
                    <span className="text-xs font-bold text-[#1A1A2E]">{ev.totalScore}</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="lg:col-span-2">
            {selected ? (
              <div className="bg-white border border-[#D1D5DB] p-6">
                <h3 className="font-bold text-[#1A1A2E] text-lg mb-1">{selected.evaluateeName}</h3>
                <p className="text-xs text-[#6B7280] mb-4">{selected.department} · {selected.formName} · {selected.year}</p>
                {selected.status === "completed" ? (
                  <>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-[#6B7280]">คะแนนรวม</span>
                        <span className="font-bold text-[#1A1A2E]">{selected.totalScore} / {selected.maxScore}</span>
                      </div>
                      <div className="w-full bg-gray-200 h-3">
                        <div className={`h-3 ${selected.totalScore >= 80 ? "bg-green-500" : selected.totalScore >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                          style={{ width: `${(selected.totalScore / selected.maxScore) * 100}%` }} />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#1A1A2E] mb-2">ความเห็นผู้ประเมิน</h4>
                      <p className="text-sm text-[#1A1A2E] bg-[#F5F5F5] p-3 border">{selected.comment}</p>
                    </div>
                    <p className="text-xs text-[#9CA3AF] mt-2">ผู้ประเมิน: {selected.evaluatorName}</p>
                  </>
                ) : (
                  <p className="text-[#9CA3AF] text-sm text-center py-8">ยังไม่ได้ดำเนินการประเมิน</p>
                )}
              </div>
            ) : (
              <div className="bg-white border border-dashed border-[#D1D5DB] flex items-center justify-center h-64">
                <p className="text-[#9CA3AF] text-sm">เลือกการประเมินเพื่อดูรายละเอียด</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </RequireRole>
  );
}
