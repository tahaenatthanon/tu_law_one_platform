"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Plus, GripVertical, CheckCircle, Clock, AlertCircle, BarChart3 } from "lucide-react";

type Project = { id: string; name: string; description: string; status: string; startDate: string; endDate: string; ownerName: string; projectType?: string; progress: number };
type Task = { id: string; projectId: string; title: string; assigneeName: string; status: string; sortOrder: number };

const COLUMNS = [
  { key: "todo", label: "📋 วางแผน", color: "border-t-gray-400", bg: "bg-gray-50" },
  { key: "in_progress", label: "🔄 กำลังดำเนินการ", color: "border-t-yellow-500", bg: "bg-yellow-50" },
  { key: "pending_approval", label: "⏳ รออนุมัติ", color: "border-t-orange-500", bg: "bg-orange-50" },
  { key: "done", label: "✅ เสร็จสิ้น", color: "border-t-green-500", bg: "bg-green-50" },
];

const PROJECT_TYPES = ["วิชาการ", "หลักสูตร", "สัมมนา", "วิจัย", "IT", "งบประมาณ"];

export default function ProjectsPage() {
  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as any)?.roles ?? [];
  const canCreate = userRoles.some((r: string) => ["super_admin", "system_admin", "dean", "dept_admin", "user"].includes(r));
  const canApprove = userRoles.some((r: string) => ["super_admin", "system_admin", "dean", "dept_admin"].includes(r));

  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [dragTask, setDragTask] = useState<Task | null>(null);

  // New project form
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("วิชาการ");
  const [formDesc, setFormDesc] = useState("");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      // Use announcement API seed pattern — create mock project data
      const mockProjects: Project[] = [
        { id: "proj-1", name: "ปรับปรุงหลักสูตรนิติศาสตรบัณฑิต 2569", description: "ปรับปรุงหลักสูตรให้ทันสมัย เพิ่มรายวิชากฎหมายดิจิทัลและ AI", status: "in_progress", startDate: "2569-01-15", endDate: "2569-08-30", ownerName: "สมชาย ใจดี", projectType: "หลักสูตร", progress: 65 },
        { id: "proj-2", name: "พัฒนาระบบประเมินผลออนไลน์", description: "พัฒนาระบบประเมินผลการเรียนการสอนแบบ Online รองรับทั้งอาจารย์และนักศึกษา", status: "planning", startDate: "2569-06-01", endDate: "2569-12-31", ownerName: "ปรีชา วิชาการ", projectType: "IT", progress: 15 },
        { id: "proj-3", name: "จัดงานวันนิติศาสตร์ 2569", description: "จัดงานวันสถาปนาคณะนิติศาสตร์ ครบรอบ 90 ปี", status: "in_progress", startDate: "2569-05-01", endDate: "2569-11-15", ownerName: "ธนา กฎหมาย", projectType: "สัมมนา", progress: 40 },
        { id: "proj-4", name: "วิจัยผลกระทบ AI ต่อวิชาชีพกฎหมาย", description: "ศึกษาผลกระทบของปัญญาประดิษฐ์ต่อการประกอบวิชาชีพกฎหมายในประเทศไทย", status: "pending_approval", startDate: "2569-08-01", endDate: "2570-07-31", ownerName: "วิชัย นักกฎหมาย", projectType: "วิจัย", progress: 10 },
        { id: "proj-5", name: "จัดซื้อครุภัณฑ์ห้องสมุดดิจิทัล", description: "จัดซื้อคอมพิวเตอร์และอุปกรณ์สำหรับห้องสมุดดิจิทัล", status: "planning", startDate: "2569-09-01", endDate: "2569-12-15", ownerName: "สมศรี การเงิน", projectType: "งบประมาณ", progress: 5 },
      ];
      setProjects(mockProjects);
    } catch { setProjects([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const mockTasks: Record<string, Task[]> = {
    "proj-1": [
      { id: "t-1", projectId: "proj-1", title: "ร่างโครงสร้างหลักสูตรใหม่", assigneeName: "สมชาย ใจดี", status: "done", sortOrder: 0 },
      { id: "t-2", projectId: "proj-1", title: "ประชาพิจารณ์หลักสูตร", assigneeName: "ปรีชา วิชาการ", status: "done", sortOrder: 1 },
      { id: "t-3", projectId: "proj-1", title: "เสนอสภาวิชาการ", assigneeName: "สมชาย ใจดี", status: "in_progress", sortOrder: 2 },
      { id: "t-4", projectId: "proj-1", title: "เสนอสภามหาวิทยาลัย", assigneeName: "คณบดี", status: "todo", sortOrder: 3 },
      { id: "t-5", projectId: "proj-1", title: "ประกาศใช้หลักสูตร", assigneeName: "ธนา กฎหมาย", status: "todo", sortOrder: 4 },
    ],
    "proj-2": [
      { id: "t-6", projectId: "proj-2", title: "วิเคราะห์ความต้องการ", assigneeName: "ปรีชา วิชาการ", status: "done", sortOrder: 0 },
      { id: "t-7", projectId: "proj-2", title: "ออกแบบ UI/UX", assigneeName: "ทีมไอที", status: "in_progress", sortOrder: 1 },
      { id: "t-8", projectId: "proj-2", title: "พัฒนา Backend", assigneeName: "ทีมไอที", status: "todo", sortOrder: 2 },
      { id: "t-9", projectId: "proj-2", title: "ทดสอบระบบ", assigneeName: "ทีม QA", status: "todo", sortOrder: 3 },
    ],
    "proj-3": [
      { id: "t-10", projectId: "proj-3", title: "ขออนุมัติงบประมาณ", assigneeName: "ธนา กฎหมาย", status: "done", sortOrder: 0 },
      { id: "t-11", projectId: "proj-3", title: "จองสถานที่", assigneeName: "ธนา กฎหมาย", status: "in_progress", sortOrder: 1 },
      { id: "t-12", projectId: "proj-3", title: "ประสานงานวิทยากร", assigneeName: "ฝ่ายวิชาการ", status: "todo", sortOrder: 2 },
    ],
  };

  const selectProject = (p: Project) => {
    setSelected(selected?.id === p.id ? null : p);
    if (selected?.id !== p.id) setTasks(mockTasks[p.id] || []);
  };

  const moveTask = (taskId: string, newStatus: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    setMessage(`✅ ย้ายงานไป "${COLUMNS.find(c => c.key === newStatus)?.label?.replace(/[^\u0E00-\u0E7Fa-zA-Z]/g, "")}" แล้ว`);
    setTimeout(() => setMessage(""), 2000);
  };

  const handleDragStart = (task: Task) => setDragTask(task);
  const handleDrop = (status: string) => { if (dragTask) moveTask(dragTask.id, status); setDragTask(null); };

  const handleCreateProject = () => {
    if (!formName.trim()) { setMessage("กรุณากรอกชื่อโครงการ"); return; }
    setSubmitLoading(true);
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: formName,
      description: formDesc,
      status: "planning",
      startDate: formStart,
      endDate: formEnd,
      ownerName: (session?.user as any)?.name || "คุณ",
      projectType: formType,
      progress: 0,
    };
    setTimeout(() => {
      setProjects(prev => [newProject, ...prev]);
      setShowForm(false);
      setFormName(""); setFormDesc(""); setFormStart(""); setFormEnd("");
      setMessage("✅ สร้างโครงการสำเร็จ");
      setSubmitLoading(false);
    }, 500);
  };

  const statusLabel = (s: string) => ({ planning: "วางแผน", in_progress: "กำลังดำเนินการ", pending_approval: "รออนุมัติ", done: "เสร็จสิ้น" }[s] ?? s);
  const statusColor = (s: string) => ({ planning: "bg-blue-100 text-blue-700", in_progress: "bg-yellow-100 text-yellow-700", pending_approval: "bg-orange-100 text-orange-700", done: "bg-green-100 text-green-700" }[s] ?? "bg-gray-100");

  if (loading) return (
    <div className="pt-0 px-6 pb-8">
      <h1 className="text-2xl font-bold text-[#1A1A2E] mb-6">โครงการ</h1>
      <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-50 border border-[#E5E7EB]" />)}</div>
    </div>
  );

  return (
    <div className="pt-0 px-6 pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">โครงการ</h1>
          <p className="text-sm text-[#6B7280]">บริหารโครงการ — ติดตามความคืบหน้า จัดการงาน และอนุมัติโครงการ · {projects.length} โครงการ</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowForm(true)} className="px-4 py-2.5 text-sm font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800] transition-colors flex items-center gap-1.5">
            <Plus className="size-4" /> สร้างโครงการ
          </button>
        )}
      </div>

      {message && <div className={`p-3 mb-4 text-sm ${message.startsWith("✅") ? "bg-green-50 border border-green-300 text-green-700" : "bg-[#FCE4E8] border border-[#A31D1D] text-[#A31D1D]"}`}>{message}</div>}

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {projects.map(p => (
          <button key={p.id} onClick={() => selectProject(p)}
            className={`text-left p-4 border transition-all ${selected?.id === p.id ? "border-[#FDB813] bg-[#FEF9E7] shadow-sm" : "border-[#D1D5DB] bg-white hover:border-[#FDB813]"}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><span className={`text-[10px] px-1.5 py-0.5 ${statusColor(p.status)}`}>{statusLabel(p.status)}</span><span className="text-[10px] text-[#9CA3AF]">{p.projectType}</span></div>
                <h3 className="font-semibold text-[#1A1A2E] text-sm mt-1.5 truncate">{p.name}</h3>
                <p className="text-xs text-[#9CA3AF] mt-1 line-clamp-2">{p.description}</p>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1"><span className="text-[10px] text-[#6B7280]">ความคืบหน้า</span><span className="text-[10px] font-medium text-[#1A1A2E]">{p.progress}%</span></div>
              <div className="w-full h-1.5 bg-[#F5F5F5]"><div className="h-1.5 bg-[#FDB813] transition-all" style={{width: `${p.progress}%`}} /></div>
            </div>
            <p className="text-[10px] text-[#9CA3AF] mt-2">👤 {p.ownerName} · {p.startDate} — {p.endDate}</p>
          </button>
        ))}
      </div>

      {/* Kanban Board */}
      {selected && (
        <div>
          <div className="bg-white border border-[#FDB813] p-4 mb-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="size-5 text-[#A31D1D]" />
              <div>
                <p className="text-sm font-bold text-[#1A1A2E]">{selected.name}</p>
                <div className="flex gap-3 mt-0.5">
                  <span className="text-[10px] text-[#6B7280]">👤 {selected.ownerName}</span>
                  <span className="text-[10px] text-[#6B7280]">📅 {selected.startDate} — {selected.endDate}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <div className="text-right"><span className="text-[11px] text-[#6B7280]">ความคืบหน้า</span><span className="text-sm font-bold text-[#1A1A2E] ml-2">{selected.progress}%</span></div>
              <div className="w-24 h-2 bg-[#F5F5F5]"><div className="h-2 bg-[#FDB813]" style={{width: `${selected.progress}%`}} /></div>
            </div>
            {canApprove && selected.status === "pending_approval" && (
              <div className="flex gap-2">
                <button onClick={() => { setProjects(prev => prev.map(p => p.id === selected.id ? {...p, status: "in_progress"} : p)); setSelected(s => s ? {...s, status:"in_progress"} : null); setMessage('\u2705 อนุมัติโครงการแล้ว'); }}
                  className="px-3 py-1.5 text-xs font-semibold bg-green-600 text-white hover:bg-green-700">อนุมัติ</button>
                <button onClick={() => { setMessage('\u274C ไม่อนุมัติโครงการ'); setTimeout(() => setMessage(""), 2000); }}
                  className="px-3 py-1.5 text-xs font-semibold bg-[#A31D1D] text-white hover:bg-[#8B1515]">ไม่อนุมัติ</button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {COLUMNS.map(col => {
              const colTasks = tasks.filter(t => t.status === col.key);
              const colStatus = col.key === "todo" ? "planning" : col.key === "done" ? "done" : col.key;
              return (
                <div key={col.key}
                  className={`bg-white border-t-2 ${col.color} border-x border-b border-[#D1D5DB]`}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => handleDrop(colStatus)}>
                  <div className={`p-3 border-b border-[#F5F5F5] ${col.bg}`}>
                    <span className="text-xs font-semibold text-[#1A1A2E]">{col.label} ({colTasks.length})</span>
                  </div>
                  <div className="p-2 space-y-2 min-h-[200px]">
                    {colTasks.map(t => (
                      <div key={t.id} draggable onDragStart={() => handleDragStart(t)}
                        className="bg-white border border-[#E5E7EB] p-2.5 text-xs cursor-grab active:cursor-grabbing hover:border-[#FDB813] hover:shadow-sm transition-all">
                        <div className="flex items-start gap-1.5">
                          <GripVertical className="size-3 text-[#D1D5DB] shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[#1A1A2E] font-medium">{t.title}</p>
                            <p className="text-[#9CA3AF] mt-1">👤 {t.assigneeName}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {colTasks.length === 0 && <p className="text-[#9CA3AF] text-xs text-center py-6">ลากงานมาวางที่นี่</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowForm(false)}>
          <div className="bg-white border border-[#FDB813] p-6 w-full max-w-lg mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">สร้างโครงการใหม่</h3>
            <div className="mb-3"><label className="block text-xs font-medium text-[#1A1A2E] mb-1">ชื่อโครงการ <span className="text-[#A31D1D]">*</span></label><input value={formName} onChange={e => setFormName(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB]" placeholder="ชื่อโครงการ" /></div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">ประเภท</label><select value={formType} onChange={e => setFormType(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB]">{PROJECT_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
              <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">วัตถุประสงค์</label><input value={formDesc} onChange={e => setFormDesc(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB]" placeholder="อธิบายวัตถุประสงค์" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">วันที่เริ่ม</label><input type="date" value={formStart} onChange={e => setFormStart(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB]" /></div>
              <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">วันที่สิ้นสุด</label><input type="date" value={formEnd} onChange={e => setFormEnd(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB]" /></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 text-sm font-medium border border-[#D1D5DB] text-[#6B7280] hover:bg-gray-100">ยกเลิก</button>
              <button onClick={handleCreateProject} disabled={submitLoading} className="flex-1 px-4 py-2.5 text-sm font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800] disabled:opacity-50">{submitLoading ? "กำลังสร้าง..." : "สร้างโครงการ"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
