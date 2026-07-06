"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

type Syllabus = {
  id: string; courseId: string; academicYear: number; semester: number; sectionNo: number;
  instructorId: string; objective?: string; description?: string; evaluationMethod?: string;
  status: string; createdAt: string;
  course: { id: string; courseCode: string; nameTh: string; credits: number };
  instructor: { id: string; firstNameTh: string; lastNameTh: string };
  topics: { id: string; weekNo: number; topic: string; description?: string; materials?: string }[];
};

type Course = { id: string; courseCode: string; nameTh: string; credits: number };

export default function SyllabusPage() {
  const { data: session } = useSession();
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedSyllabus, setSelectedSyllabus] = useState<Syllabus | null>(null);

  // Create form
  const [courseId, setCourseId] = useState("");
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear() + 543);
  const [semester, setSemester] = useState(1);
  const [objective, setObjective] = useState("");
  const [description, setDescription] = useState("");
  const [evaluationMethod, setEvaluationMethod] = useState("");
  const [topics, setTopics] = useState<{ weekNo: number; topic: string; description: string; materials: string }[]>(
    Array.from({ length: 16 }, (_, i) => ({ weekNo: i + 1, topic: "", description: "", materials: "" }))
  );
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchSyllabi = useCallback(async () => {
    try {
      const res = await fetch("/api/syllabus");
      const json = await res.json();
      if (json.success) setSyllabi(json.data);
    } catch { setSyllabi([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSyllabi(); }, [fetchSyllabi]);

  useEffect(() => {
    fetch("/api/syllabus?courseId=all").then(r => r.json()).then(j => {
      // Fallback: use static courses since API doesn't have a courses endpoint yet
    }).catch(() => {});
  }, []);

  const handleCreate = async () => {
    if (!courseId) { setMessage("กรุณาเลือกรายวิชา"); return; }
    setSubmitLoading(true);
    setMessage("");
    try {
      const filteredTopics = topics.filter(t => t.topic.trim());
      const res = await fetch("/api/syllabus", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId, academicYear: academicYear - 543, semester, sectionNo: 1,
          instructorId: (session?.user as Record<string, unknown>)?.id ?? "",
          objective, description, evaluationMethod,
          topics: filteredTopics,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage("สร้างแผนการสอนสำเร็จ");
        setShowCreate(false);
        fetchSyllabi();
        resetForm();
      } else {
        setMessage(json.error?.message ?? "เกิดข้อผิดพลาด");
      }
    } catch { setMessage("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้"); }
    setSubmitLoading(false);
  };

  const resetForm = () => {
    setCourseId(""); setObjective(""); setDescription(""); setEvaluationMethod("");
    setTopics(Array.from({ length: 16 }, (_, i) => ({ weekNo: i + 1, topic: "", description: "", materials: "" })));
  };

  const THAI_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const formatDate = (d: string) => { const dt = new Date(d); return `${dt.getDate()} ${THAI_MONTHS[dt.getMonth()]} ${dt.getFullYear() + 543}`; };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">ระบบแผนการสอน (Syllabus)</h1>
          <p className="text-sm text-[#6B7280] mt-1">สร้างและดูแผนการสอนประจำรายวิชา</p>
        </div>
        <button onClick={() => { setShowCreate(true); setSelectedSyllabus(null); }}
          className="px-4 py-2.5 text-sm font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800] transition-colors">
          + สร้างแผนการสอน
        </button>
      </div>

      {loading ? <p className="text-[#9CA3AF]">กำลังโหลด...</p> : syllabi.length === 0 ? (
        <div className="text-center py-16 text-[#9CA3AF]">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          <p className="text-sm">ยังไม่มีแผนการสอน</p>
        </div>
      ) : (
        <div className="space-y-3">
          {syllabi.map((s) => (
            <div key={s.id} onClick={() => setSelectedSyllabus(s)}
              className="bg-white border border-[#D1D5DB] p-4 hover:border-[#FDB813] cursor-pointer transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-[#1A1A2E]">{s.course?.courseCode ?? "?"} — {s.course?.nameTh ?? "ไม่ระบุ"}</h3>
                  <p className="text-sm text-[#6B7280] mt-1">
                    ปีการศึกษา {s.academicYear + 543} ภาค {s.semester} | {s.topics?.length ?? 0} หัวข้อ
                  </p>
                  <p className="text-xs text-[#9CA3AF] mt-1">ผู้สอน: {s.instructor?.firstNameTh} {s.instructor?.lastNameTh}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 font-medium ${s.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {s.status === "published" ? "เผยแพร่แล้ว" : "ฉบับร่าง"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedSyllabus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setSelectedSyllabus(null)}>
          <div className="bg-white border border-[#FDB813] p-6 w-full max-w-3xl mx-4 shadow-xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#1A1A2E]">{selectedSyllabus.course?.courseCode} — {selectedSyllabus.course?.nameTh}</h3>
              <button onClick={() => setSelectedSyllabus(null)} className="text-[#9CA3AF] hover:text-[#1A1A2E]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div><span className="text-[#6B7280]">ปีการศึกษา:</span> {selectedSyllabus.academicYear + 543}</div>
              <div><span className="text-[#6B7280]">ภาคเรียน:</span> {selectedSyllabus.semester}</div>
              <div><span className="text-[#6B7280]">หน่วยกิต:</span> {selectedSyllabus.course?.credits}</div>
              <div><span className="text-[#6B7280]">ผู้สอน:</span> {selectedSyllabus.instructor?.firstNameTh} {selectedSyllabus.instructor?.lastNameTh}</div>
            </div>
            {selectedSyllabus.objective && <div className="mb-4"><h4 className="text-sm font-semibold text-[#1A1A2E] mb-1">วัตถุประสงค์</h4><p className="text-sm text-[#6B7280]">{selectedSyllabus.objective}</p></div>}
            {selectedSyllabus.evaluationMethod && <div className="mb-4"><h4 className="text-sm font-semibold text-[#1A1A2E] mb-1">วิธีการประเมินผล</h4><p className="text-sm text-[#6B7280]">{selectedSyllabus.evaluationMethod}</p></div>}
            {selectedSyllabus.topics.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-[#1A1A2E] mb-2">แผนการสอนรายสัปดาห์</h4>
                <table className="w-full text-sm border-collapse">
                  <thead><tr className="bg-gray-50"><th className="border border-[#D1D5DB] px-3 py-2 text-left text-[#6B7280] font-medium">สัปดาห์</th><th className="border border-[#D1D5DB] px-3 py-2 text-left text-[#6B7280] font-medium">หัวข้อ</th><th className="border border-[#D1D5DB] px-3 py-2 text-left text-[#6B7280] font-medium">เอกสารประกอบ</th></tr></thead>
                  <tbody>
                    {selectedSyllabus.topics.map(t => (
                      <tr key={t.id}><td className="border border-[#D1D5DB] px-3 py-2 text-center">{t.weekNo}</td><td className="border border-[#D1D5DB] px-3 py-2">{t.topic}{t.description && <p className="text-xs text-[#9CA3AF]">{t.description}</p>}</td><td className="border border-[#D1D5DB] px-3 py-2 text-[#9CA3AF]">{t.materials || "-"}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowCreate(false)}>
          <div className="bg-white border border-[#FDB813] p-6 w-full max-w-3xl mx-4 shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">สร้างแผนการสอน</h3>
            {message && <div className={`p-3 mb-4 text-sm ${message.includes("สำเร็จ") ? "bg-green-50 border border-green-300 text-green-700" : "bg-[#FCE4E8] border border-[#A31D1D] text-[#A31D1D]"}`}>{message}</div>}

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">รหัสรายวิชา</label><input type="text" value={courseId} onChange={e => setCourseId(e.target.value)} placeholder="LAW101" className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813]" /></div>
              <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">ปีการศึกษา (พ.ศ.)</label><input type="number" value={academicYear} onChange={e => setAcademicYear(parseInt(e.target.value))} className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813]" /></div>
              <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">ภาคเรียน</label><select value={semester} onChange={e => setSemester(parseInt(e.target.value))} className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813]"><option value={1}>1</option><option value={2}>2</option><option value={3}>ฤดูร้อน</option></select></div>
            </div>

            <div className="mb-3"><label className="block text-xs font-medium text-[#1A1A2E] mb-1">วัตถุประสงค์</label><textarea value={objective} onChange={e => setObjective(e.target.value)} rows={2} className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813]" /></div>
            <div className="mb-3"><label className="block text-xs font-medium text-[#1A1A2E] mb-1">วิธีการประเมินผล</label><input type="text" value={evaluationMethod} onChange={e => setEvaluationMethod(e.target.value)} placeholder="สอบกลางภาค 40% สอบปลายภาค 60%" className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813]" /></div>

            <h4 className="text-sm font-semibold text-[#1A1A2E] mb-2">แผนการสอนรายสัปดาห์</h4>
            <div className="space-y-2 mb-4">
              {topics.map((t, idx) => (
                <div key={t.weekNo} className="flex gap-2 items-start">
                  <span className="w-10 text-center text-xs font-bold text-[#6B7280] pt-2">{t.weekNo}</span>
                  <input type="text" value={t.topic} onChange={e => { const n = [...topics]; n[idx] = { ...n[idx], topic: e.target.value }; setTopics(n); }}
                    placeholder={`หัวข้อสัปดาห์ที่ ${t.weekNo}`} className="flex-1 px-2 py-1.5 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813]" />
                  <input type="text" value={t.materials} onChange={e => { const n = [...topics]; n[idx] = { ...n[idx], materials: e.target.value }; setTopics(n); }}
                    placeholder="เอกสาร" className="w-32 px-2 py-1.5 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813]" />
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 text-sm font-medium border border-[#D1D5DB] text-[#6B7280] hover:bg-gray-100 transition-all">ยกเลิก</button>
              <button onClick={handleCreate} disabled={submitLoading}
                className="flex-1 px-4 py-2.5 text-sm font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800] disabled:opacity-50 transition-all">
                {submitLoading ? "กำลังบันทึก..." : "สร้างแผนการสอน"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
