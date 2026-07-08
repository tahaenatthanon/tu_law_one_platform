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
  { id: "room", name: "ระบบจองห้องประชุม" },
  { id: "support", name: "ระบบฝ่ายสนับสนุน" },
  { id: "projects", name: "โครงการ" },
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
      { id: "erp-budget", name: "งบประมาณ", description: "ติดตามงบประมาณรายจ่ายประจำปี", url: "/dashboard/erp/budget", status: "online" },
      { id: "erp-finance", name: "การเงิน", description: "บริหารการเงิน รายรับ-รายจ่าย", url: "/dashboard/erp/finance", status: "online" },
      { id: "erp-purchasing", name: "จัดซื้อ", description: "ใบขอซื้อและใบสั่งซื้อ", url: "/dashboard/erp/purchasing", status: "online" },
      { id: "erp-supply", name: "พัสดุ", description: "จัดการพัสดุและสินค้าคงคลัง", url: "/dashboard/erp/inventory", status: "online" },
      { id: "erp-asset", name: "ครุภัณฑ์", description: "ทะเบียนครุภัณฑ์และทรัพย์สิน", url: "/dashboard/erp/assets", status: "online" },
      { id: "erp-report", name: "รายงาน", description: "รายงานสรุปผลการดำเนินงาน", url: "/dashboard/erp/reports", status: "online" },
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
      { id: "eoffice-in", name: "หนังสือเข้า", description: "รับและลงทะเบียนหนังสือเข้า", url: "/dashboard/eoffice/incoming", status: "online" },
      { id: "eoffice-out", name: "หนังสือออก", description: "ออกและติดตามหนังสือออก", url: "/dashboard/eoffice/outgoing", status: "online" },
      { id: "eoffice-circulate", name: "เวียนเอกสาร", description: "เวียนเอกสารภายในหน่วยงาน", url: "/dashboard/eoffice/circulation", status: "online" },
      { id: "eoffice-workflow", name: "Workflow อนุมัติ", description: "กำหนดขั้นตอนและอนุมัติออนไลน์", url: "/dashboard/eoffice/workflow", status: "online" },
      { id: "eoffice-meeting", name: "ประชุม", description: "จัดการวาระประชุมและมติที่ประชุม", url: "/dashboard/eoffice/meetings", status: "online" },
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
      { id: "storage-pool", name: "คลังเอกสาร", description: "Central / Department / Personal Pool", url: "/dashboard/documents", status: "online" },
      { id: "storage-version", name: "Version", description: "ประวัติการแก้ไขและย้อนเวอร์ชัน", url: "/dashboard/documents/version", status: "online" },
      { id: "storage-ocr", name: "OCR Search", description: "ค้นหาข้อความในเอกสารด้วย OCR", url: "/dashboard/documents/ocr-search", status: "online" },
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
      { id: "acad-curriculum", name: "หลักสูตร", description: "จัดการหลักสูตรและโครงสร้างหลักสูตร", url: "/dashboard/academic/curriculum", status: "online" },
      { id: "acad-course", name: "รายวิชา", description: "ข้อมูลรายวิชาและคำอธิบายรายวิชา", url: "/dashboard/academic/courses", status: "online" },
      { id: "acad-schedule", name: "ตารางเรียน", description: "ตารางเรียนรายภาคการศึกษา", url: "/dashboard/academic/schedule", status: "online" },
      { id: "acad-exam", name: "ตารางสอบ", description: "ตารางสอบกลางภาคและปลายภาค", url: "/dashboard/academic/exams", status: "online" },
      { id: "acad-request", name: "คำร้อง", description: "ยื่นคำร้องออนไลน์", url: "/dashboard/academic/petitions", status: "online" },
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
      { id: "hr-profile", name: "ประวัติบุคลากร", description: "ข้อมูลประวัติบุคลากรและทะเบียนประวัติ", url: "/dashboard/hr/personnel", status: "online" },
      { id: "hr-leave", name: "ลา", description: "ยื่นคำขอลาและติดตามสถานะ", url: "/dashboard/hr/leave", status: "online" },
      { id: "hr-time", name: "เวลาทำงาน", description: "บันทึกเวลาเข้า-ออกงาน", url: "/dashboard/hr/attendance", status: "online" },
      { id: "hr-eval", name: "ประเมินผล", description: "ประเมินผลการปฏิบัติงานประจำปี", url: "/dashboard/hr/evaluation", status: "online" },
      { id: "hr-training", name: "อบรม", description: "ลงทะเบียนอบรมและประวัติการอบรม", url: "/dashboard/hr/training", status: "online" },
      { id: "hr-salary", name: "เงินเดือน", description: "ดูสลิปเงินเดือนและประวัติการจ่าย", url: "/dashboard/hr/salary", status: "online" },
    ],
    allowedRoles: ["super_admin", "system_admin", "dean", "dept_admin"],
  },

  // ─── ระบบจองห้องประชุม ───
  {
    id: "room",
    name: "ระบบจองห้องประชุม",
    description: "จองห้องประชุม ดูตารางการจอง และจัดการการจอง",
    url: "#",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    category: "room",
    status: "online",
    subApps: [
      { id: "room-booking", name: "จองห้องประชุม", description: "จองห้องประชุมออนไลน์", url: "/dashboard/room-booking/booking", status: "online" },
      { id: "room-calendar", name: "ปฏิทินการจอง", description: "ดูตารางการจองห้องประชุม", url: "/dashboard/room-booking/schedule", status: "online" },
    ],
    allowedRoles: ["super_admin", "system_admin", "dean", "dept_admin", "user"],
  },

  // ─── ระบบฝ่ายสนับสนุน ───
  {
    id: "support",
    name: "ระบบฝ่ายสนับสนุน",
    description: "Helpdesk แจ้งปัญหาด้าน IT และระบบห้องสมุด",
    url: "#",
    icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
    category: "support",
    status: "online",
    subApps: [
      { id: "support-helpdesk", name: "Helpdesk", description: "แจ้งปัญหาด้าน IT และระบบ", url: "/dashboard/helpdesk/it", status: "online" },
      { id: "support-library", name: "ห้องสมุด", description: "สืบค้นทรัพยากร ยืม-คืน และจองหนังสือ", url: "/dashboard/helpdesk/library", status: "online" },
    ],
    allowedRoles: ["super_admin", "system_admin", "dean", "dept_admin", "user", "viewer"],
  },

  // ─── โครงการ ───
  {
    id: "projects",
    name: "โครงการ",
    description: "บริหารโครงการ — Kanban Board, ติดตามความคืบหน้า, อนุมัติโครงการ",
    url: "/dashboard/projects/projects",
    icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
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

