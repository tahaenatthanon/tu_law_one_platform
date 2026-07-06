"use client";

import { useState, useEffect } from "react";

type Eval = { id: string; evalYear: number; evalPeriod: string; totalScore?: number; grade?: string; comment?: string; status: string; createdAt: string };

export default function EvaluationPage() {
  const [evaluations, setEvaluations] = useState<Eval[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/evaluation").then(r => r.json()).then(j => { if (j.success) setEvaluations(j.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const statusLabel = (s: string) => ({ draft: "ฉบับร่าง", submitted: "ส่งแล้ว", reviewed: "ผ่านการพิจารณา", approved: "อนุมัติ" }[s] ?? s);
  const statusColor = (s: string) => ({ draft: "text-yellow-600", submitted: "text-blue-600", reviewed: "text-purple-600", approved: "text-green-600" }[s] ?? "text-gray-500");

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">ระบบประเมินผลการปฏิบัติงาน</h1>
      <p className="text-sm text-[#6B7280] mb-6">ดูผลการประเมินประจำปี</p>

      {loading ? <p className="text-[#9CA3AF]">กำลังโหลด...</p> : evaluations.length === 0 ? (
        <div className="text-center py-16 text-[#9CA3AF]">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
          <p className="text-sm">ไม่มีข้อมูลการประเมิน</p>
        </div>
      ) : (
        <div className="space-y-3">
          {evaluations.map(e => (
            <div key={e.id} className="bg-white border border-[#D1D5DB] p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#1A1A2E]">ปี {e.evalYear + 543}</span>
                    <span className="text-xs text-[#9CA3AF]">{e.evalPeriod}</span>
                  </div>
                  {e.totalScore !== undefined && <p className="text-sm mt-1">คะแนนรวม: <span className="font-bold text-[#A31D1D]">{Number(e.totalScore).toFixed(2)}</span></p>}
                  {e.grade && <p className="text-sm">เกรด: <span className="font-bold text-[#1A1A2E]">{e.grade}</span></p>}
                  {e.comment && <p className="text-xs text-[#6B7280] mt-1">{e.comment}</p>}
                </div>
                <span className={`text-xs px-2 py-0.5 font-medium ${statusColor(e.status)}`}>{statusLabel(e.status)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
