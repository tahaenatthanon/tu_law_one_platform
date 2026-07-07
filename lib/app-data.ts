/* ─── Application Data ─── */

export type AppStatus = "online" | "offline" | "maintenance";
export type UserRole = "super_admin" | "system_admin" | "dean" | "dept_admin" | "user" | "viewer";

export interface SubApp {
  id: string;
  name: string;
  description: string;
  url: string;
  status: AppStatus;
  icon?: string;
}

export interface Application {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  category: string;
  status: AppStatus;
  subApps: SubApp[];
  /** role ที่มีสิทธิ์เห็นแอปนี้ — ถ้าไม่ระบุ = ทุก role เห็น */
  allowedRoles?: UserRole[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;       // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD (สำหรับ event หลายวัน)
  time?: string;      // HH:MM (เวลาเริ่ม)
  endTime?: string;   // HH:MM (เวลาสิ้นสุด)
  location?: string;
  category: "meeting" | "seminar" | "exam" | "holiday" | "deadline";
  description?: string;
}

export const appCategories = [
  { id: "erp", name: "ERP" },
  { id: "eoffice", name: "E-Office" },
  { id: "storage", name: "ระบบจัดเก็บ" },
  { id: "academic", name: "ระบบงานวิชาการ" },
  { id: "hr", name: "ระบบงานบุคคล" },
  { id: "projects", name: "โครงการ" },
  { id: "bookmeeting", name: "จองห้องประชุม" },
];

export const applications: Application[] = [
  // ─── ERP ───
  {
    id: "erp",
    name: "ERP",
    description: "งบประมาณ การเงิน พัสดุ ครุภัณฑ์ รายงาน",
    url: "#",
    icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
    category: "erp",
    status: "online",
    subApps: [
      { id: "erp-budget", name: "งบประมาณ", description: "ติดตามงบประมาณรายจ่ายประจำปี", url: "https://erp.law.tu.ac.th/budget", status: "online" },
      { id: "erp-finance", name: "การเงิน", description: "บริหารการเงิน รายรับ-รายจ่าย", url: "https://erp.law.tu.ac.th/finance", status: "online" },
      { id: "erp-supply", name: "พัสดุ", description: "จัดการพัสดุและสินค้าคงคลัง", url: "https://erp.law.tu.ac.th/supply", status: "online" },
      { id: "erp-asset", name: "ครุภัณฑ์", description: "ทะเบียนครุภัณฑ์และทรัพย์สิน", url: "https://erp.law.tu.ac.th/asset", status: "online" },
      { id: "erp-report", name: "รายงาน", description: "รายงานสรุปผลการดำเนินงาน", url: "https://erp.law.tu.ac.th/report", status: "online" },
    ],
    allowedRoles: ["super_admin", "system_admin", "dean", "dept_admin"],
  },

  // ─── E-Office ───
  {
    id: "eoffice",
    name: "E-Office",
    description: "ระบบสารบรรณ — หนังสือเข้า-ออก เวียนเอกสาร Workflow อนุมัติ ประชุม",
    url: "#",
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    category: "eoffice",
    status: "online",
    subApps: [
      { id: "eoffice-in", name: "หนังสือเข้า", description: "รับและลงทะเบียนหนังสือเข้า", url: "https://eoffice.law.tu.ac.th/in", status: "online" },
      { id: "eoffice-out", name: "หนังสือออก", description: "ออกและติดตามหนังสือออก", url: "https://eoffice.law.tu.ac.th/out", status: "online" },
      { id: "eoffice-circulate", name: "เวียนเอกสาร", description: "เวียนเอกสารภายในหน่วยงาน", url: "https://eoffice.law.tu.ac.th/circulate", status: "online" },
      { id: "eoffice-workflow", name: "Workflow อนุมัติ", description: "กำหนดขั้นตอนและอนุมัติออนไลน์", url: "https://eoffice.law.tu.ac.th/workflow", status: "online" },
      { id: "eoffice-meeting", name: "ประชุม", description: "จัดการวาระประชุมและมติที่ประชุม", url: "https://eoffice.law.tu.ac.th/meeting", status: "online" },
    ],
    allowedRoles: ["super_admin", "system_admin", "dean", "dept_admin", "user"],
  },

  // ─── ระบบจัดเก็บ ───
  {
    id: "storage",
    name: "ระบบจัดเก็บ",
    description: "คลังเอกสาร 3 ระดับ — Central / Department / Personal Pool พร้อม OCR",
    url: "#",
    icon: "M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z",
    category: "storage",
    status: "online",
    subApps: [
      { id: "storage-central", name: "Central Pool", description: "คลังเอกสารกลางสำหรับทุกหน่วยงาน", url: "https://storage.law.tu.ac.th/central", status: "online" },
      { id: "storage-dept", name: "Department Pool", description: "คลังเอกสารระดับแผนก", url: "https://storage.law.tu.ac.th/dept", status: "online" },
      { id: "storage-personal", name: "Personal Pool", description: "คลังเอกสารส่วนตัว 5 GB", url: "https://storage.law.tu.ac.th/personal", status: "online" },
      { id: "storage-version", name: "Version", description: "ประวัติการแก้ไขและย้อนเวอร์ชัน", url: "https://storage.law.tu.ac.th/version", status: "online" },
      { id: "storage-ocr", name: "OCR Search", description: "ค้นหาข้อความในเอกสารด้วย OCR", url: "https://storage.law.tu.ac.th/ocr", status: "online" },
    ],
    allowedRoles: ["super_admin", "system_admin", "dean", "dept_admin", "user"],
  },

  // ─── ระบบงานวิชาการ ───
  {
    id: "academic",
    name: "ระบบงานวิชาการ",
    description: "หลักสูตร รายวิชา ตารางเรียน ตารางสอบ คำร้อง",
    url: "#",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    category: "academic",
    status: "online",
    subApps: [
      { id: "acad-curriculum", name: "หลักสูตร", description: "จัดการหลักสูตรและโครงสร้างหลักสูตร", url: "https://academic.law.tu.ac.th/curriculum", status: "online" },
      { id: "acad-course", name: "รายวิชา", description: "ข้อมูลรายวิชาและคำอธิบายรายวิชา", url: "https://academic.law.tu.ac.th/course", status: "online" },
      { id: "acad-schedule", name: "ตารางเรียน", description: "ตารางเรียนรายภาคการศึกษา", url: "https://academic.law.tu.ac.th/schedule", status: "online" },
      { id: "acad-exam", name: "ตารางสอบ", description: "ตารางสอบกลางภาคและปลายภาค", url: "https://academic.law.tu.ac.th/exam", status: "online" },
      { id: "acad-request", name: "คำร้อง", description: "ยื่นคำร้องออนไลน์", url: "https://academic.law.tu.ac.th/request", status: "online" },
    ],
    allowedRoles: ["super_admin", "system_admin", "dean", "dept_admin", "user"],
  },

  // ─── ระบบงานบุคคล ───
  {
    id: "hr",
    name: "ระบบงานบุคคล",
    description: "ประวัติบุคลากร ลา เวลาทำงาน ประเมินผล อบรม",
    url: "#",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    category: "hr",
    status: "online",
    subApps: [
      { id: "hr-profile", name: "ประวัติบุคลากร", description: "ข้อมูลประวัติบุคลากรและทะเบียนประวัติ", url: "https://hr.law.tu.ac.th/profile", status: "online" },
      { id: "hr-leave", name: "ลา", description: "ยื่นคำขอลาและติดตามสถานะ", url: "https://hr.law.tu.ac.th/leave", status: "online" },
      { id: "hr-time", name: "เวลาทำงาน", description: "บันทึกเวลาเข้า-ออกงาน", url: "https://hr.law.tu.ac.th/time", status: "online" },
      { id: "hr-eval", name: "ประเมินผล", description: "ประเมินผลการปฏิบัติงานประจำปี", url: "https://hr.law.tu.ac.th/eval", status: "online" },
      { id: "hr-training", name: "อบรม", description: "ลงทะเบียนอบรมและประวัติการอบรม", url: "https://hr.law.tu.ac.th/training", status: "online" },
    ],
    allowedRoles: ["super_admin", "system_admin", "dean", "dept_admin"],
  },

  // ─── Book Meeting ───
  {
    id: "bookmeeting",
    name: "Book Meeting",
    description: "ระบบจองห้องประชุม — จองห้อง ดูปฏิทิน เชื่อม MS Teams",
    url: "#",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    category: "bookmeeting",
    status: "online",
    subApps: [
      { id: "bm-book", name: "จองห้อง", description: "จองห้องประชุมตามวันและเวลา", url: "https://room.law.tu.ac.th/book", status: "online" },
      { id: "bm-calendar", name: "ปฏิทิน", description: "ดูตารางการใช้ห้องประชุม", url: "https://room.law.tu.ac.th/calendar", status: "online" },
      { id: "bm-teams", name: "MS Teams", description: "เชื่อมต่อและสร้างลิงก์ประชุมออนไลน์", url: "https://room.law.tu.ac.th/teams", status: "online" },
      { id: "bm-history", name: "ประวัติ", description: "ประวัติการจองย้อนหลัง", url: "https://room.law.tu.ac.th/history", status: "online" },
    ],
    allowedRoles: ["super_admin", "system_admin", "dean", "dept_admin", "user", "viewer"],
  },

  // ─── โครงการ ───
  {
    id: "projects",
    name: "Projects",
    description: "ระบบบริหารจัดการโครงการ — Kanban Board, Milestone Tracking, Multi-step Approval",
    url: "/dashboard/projects",
    icon: "M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2",
    category: "projects",
    status: "online",
    subApps: [],
    allowedRoles: ["super_admin", "system_admin", "dean", "dept_admin", "user", "viewer"],
  },
];

/* ─── Calendar Events (M365 Activity Calendar) ─── */

export const calendarEvents: CalendarEvent[] = [
  // ─── กรกฎาคม 2569 ───
  {
    id: "cal-001",
    title: "ปฐมนิเทศนักศึกษาใหม่ ปีการศึกษา 2569",
    date: "2026-07-07",
    time: "09:00",
    endTime: "16:30",
    location: "ห้องประชุมใหญ่ ชั้น 5 คณะนิติศาสตร์",
    category: "seminar",
    description: "ปฐมนิเทศนักศึกษาใหม่ชั้นปีที่ 1 ประจำปีการศึกษา 2569",
  },
  {
    id: "cal-002",
    title: "ประชุมคณะกรรมการประจำคณะ ครั้งที่ 7/2569",
    date: "2026-07-10",
    time: "13:30",
    endTime: "16:30",
    location: "ห้องประชุมศาสตราจารย์สัญญา ธรรมศักดิ์",
    category: "meeting",
    description: "วาระพิจารณาหลักสูตรใหม่และงบประมาณประจำปี",
  },
  {
    id: "cal-003",
    title: "วันอาสาฬหบูชา",
    date: "2026-07-11",
    category: "holiday",
    description: "วันหยุดนักขัตฤกษ์",
  },
  {
    id: "cal-004",
    title: "วันเข้าพรรษา",
    date: "2026-07-12",
    category: "holiday",
    description: "วันหยุดนักขัตฤกษ์",
  },
  {
    id: "cal-005",
    title: "สัมมนาวิชาการ: กฎหมาย AI กับอนาคต",
    date: "2026-07-15",
    time: "09:00",
    endTime: "16:00",
    location: "ห้องประชุมชั้น 3 อาคารป๋วย อึ๊งภากรณ์",
    category: "seminar",
    description: "สัมมนาทางวิชาการ เรื่องกฎหมายปัญญาประดิษฐ์",
  },
  {
    id: "cal-006",
    title: "กำหนดการสอบกลางภาค 1/2569",
    date: "2026-07-20",
    endDate: "2026-07-25",
    category: "exam",
    description: "ช่วงสอบกลางภาคการศึกษา ภาค 1/2569",
  },
  {
    id: "cal-007",
    title: "ประชุมหัวหน้าแผนกและผู้บริหาร",
    date: "2026-07-22",
    time: "10:00",
    endTime: "12:00",
    location: "ห้องประชุมคณบดี",
    category: "meeting",
    description: "ติดตามผลการดำเนินงานและแผนกลยุทธ์",
  },
  {
    id: "cal-008",
    title: "อบรมเชิงปฏิบัติการ PDPA สำหรับบุคลากร",
    date: "2026-07-28",
    time: "13:00",
    endTime: "16:30",
    location: "ห้องฝึกอบรม IT ชั้น 2",
    category: "seminar",
    description: "อบรมการปฏิบัติตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล",
  },
  // ─── สิงหาคม 2569 ───
  {
    id: "cal-009",
    title: "วันเฉลิมพระชนมพรรษา สมเด็จพระนางเจ้าฯ พระบรมราชินี",
    date: "2026-06-03",
    category: "holiday",
    description: "วันเฉลิมพระชนมพรรษา 3 มิถุนายน",
  },
  {
    id: "cal-010",
    title: "รับสมัครทุนวิจัยคณะนิติศาสตร์",
    date: "2026-08-01",
    endDate: "2026-08-15",
    category: "deadline",
    description: "เปิดรับข้อเสนอโครงการวิจัย ประจำปีงบประมาณ 2569",
  },
  {
    id: "cal-011",
    title: "ประชุมสภาคณาจารย์",
    date: "2026-08-05",
    time: "09:00",
    endTime: "12:00",
    location: "ห้องประชุมศาสตราจารย์สัญญา ธรรมศักดิ์",
    category: "meeting",
    description: "ประชุมสภาคณาจารย์คณะนิติศาสตร์",
  },
  {
    id: "cal-012",
    title: "วันแม่แห่งชาติ",
    date: "2026-08-12",
    category: "holiday",
    description: "วันหยุดนักขัตฤกษ์",
  },
  {
    id: "cal-013",
    title: "พิธีไหว้ครูคณะนิติศาสตร์",
    date: "2026-08-18",
    time: "08:30",
    endTime: "12:00",
    location: "หอประชุมใหญ่ มธ. ท่าพระจันทร์",
    category: "seminar",
    description: "พิธีไหว้ครูประจำปีการศึกษา 2569",
  },
  {
    id: "cal-014",
    title: "หมดเขตส่งบทความวารสารนิติศาสตร์",
    date: "2026-08-25",
    category: "deadline",
    description: "วันสุดท้ายการส่งบทความเพื่อตีพิมพ์วารสารนิติศาสตร์",
  },
];

