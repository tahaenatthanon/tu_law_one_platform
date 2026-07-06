@AGENTS.md

# TULAW ONE PLATFORM

## Project Identity

- **Name:** TULAW ONE PLATFORM (TOP)
- **Description:** ระบบศูนย์กลางดิจิทัลสำหรับคณะนิติศาสตร์ มหาวิทยาลัยธรรมศาสตร์ (Digital Central Platform for Faculty of Law, Thammasat University)
- **Goal:** รวมระบบทั้งหมดไว้ในแพลตฟอร์มเดียว ลดการ Login หลายระบบ เพิ่มประสิทธิภาพการทำงาน รองรับ Real-time และเพิ่มความปลอดภัยของข้อมูล

---

## Technology Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Frontend       | Next.js 16+ (App Router, Turbopack) |
| Language       | TypeScript 5 (strict mode)          |
| UI Framework   | shadcn/ui + Tailwind CSS 3          |
| Backend        | Next.js Route Handler               |
| Authentication | NextAuth.js 4 (Credentials + JWT)   |
| ORM            | Prisma ORM 7                        |
| Database       | PostgreSQL                          |
| API            | REST API                            |
| Package Manager| npm                                 |
| Version Control| Git + GitHub                        |

---

## Project Structure (Planned)

```
tulaw-oneplatform/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── login/
│   │   └── layout.tsx
│   ├── (dashboard)/              # Protected route group
│   │   ├── dashboard/
│   │   ├── application-hub/
│   │   ├── intranet/
│   │   ├── chat/
│   │   ├── book-meeting/
│   │   ├── documents/
│   │   ├── projects/
│   │   ├── users/
│   │   ├── audit-log/
│   │   └── settings/
│   ├── api/                      # Route Handlers (REST API)
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/                   # UI Components
│   ├── ui/                       # shadcn/ui components
│   ├── layouts/                  # Layout components
│   ├── forms/                    # Form components
│   └── shared/                   # Shared/reusable components
├── lib/                          # Utility functions
│   ├── auth.ts                   # NextAuth configuration
│   ├── prisma.ts                 # Prisma client singleton
│   ├── validations.ts            # Zod schemas
│   └── utils.ts                  # Helper functions
├── prisma/
│   └── schema.prisma             # Database schema
├── hooks/                        # Custom React hooks
├── types/                        # TypeScript type definitions
├── middleware.ts                  # Next.js Middleware (auth guard)
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts
```

---

## Conventions & Rules

### TypeScript
- Strict mode is ON — no `any` unless absolutely necessary
- Use `type` for simple unions/intersections, `interface` for object shapes
- All function parameters and return types must be explicitly typed
- Prefer `const` over `let`; never use `var`

### React / Next.js
- Use **Server Components** by default; opt into `"use client"` only when needed (interactivity, hooks, browser APIs)
- Use **Route Handlers** (`app/api/`) for all API endpoints — no external backend
- Use **middleware.ts** for authentication gating
- Use **React Server Actions** only for mutations where it simplifies the data flow; prefer Route Handlers for complex APIs

### File Naming
- Files: `kebab-case.tsx`, `kebab-case.ts`
- Components: `PascalCase` (filename matches component name)
- Route folders: `kebab-case`
- API routes: `app/api/[resource]/route.ts`

### Styling
- Tailwind CSS 3 utility classes only — no inline styles
- Use shadcn/ui components for consistent design
- Support Thai language (font: prompt)

### Color Theme (TU Law — ธรรมศาสตร์นิติศาสตร์)
ใช้ชุดสีนี้เป็นหลัก **ทุกหน้า** ของแพลตฟอร์ม:

| โทน          | Hex Code   | Tailwind Usage          | บทบาท |
|-------------|------------|-------------------------|--------|
| **แดง TU**  | `#8B1515`  | `bg-[#8B1515]`         | พื้นหลัง Sidebar, แถบนำทาง, องค์ประกอบหลัก |
| **ทอง TU**  | `#FDB813`  | `bg-[#FDB813]`         | ปุ่มหลัก, Active state, ไฮไลท์, ตราสัญลักษณ์ |
| **แดงเข้ม** | `#A31D1D`  | `text-[#A31D1D]`       | ลิงก์, ข้อความเน้น, ปุ่มรอง |
| **พื้นหลัง**| `#F5F5F5`  | `bg-[#F5F5F5]`         | พื้นหลัง Dashboard |
| **ข้อความหลัก** | `#1A1A2E` | `text-[#1A1A2E]`    | ข้อความหลัก, หัวข้อ |
| **ข้อความรอง** | `#6B7280` | `text-[#6B7280]`    | คำอธิบาย, ข้อความช่วยเหลือ |
| **ขอบ/เส้น** | `#D1D5DB` | `border-[#D1D5DB]`    | ขอบ Input, เส้นแบ่ง |
| **ขาว**     | `#FFFFFF`  | `bg-white`              | พื้นหลัง Card, ฟอร์ม |

**กฎการใช้สี:**
- **Sidebar:** พื้นหลัง `#8B1515` (แดง TU), ข้อความ/ไอคอน `white`, Active item `#FDB813` (ทอง) พร้อมตัวอักษร `#8B1515`
- **ปุ่มหลัก (Primary):** พื้น `#FDB813` ตัวอักษร `#1A1A2E`, hover `#E5A800`
- **ปุ่มรอง/ลิงก์:** ตัวอักษร `#A31D1D`, hover `#8B1515`
- **Badge/Highlight:** `#FDB813` หรือ `#A31D1D` ตามบริบท
- **Error/Alert:** พื้น `#FCE4E8` ขอบ `#A31D1D` ตัวอักษร `#A31D1D`
- **Success:** พื้น `#ECFDF5` ขอบ `#059669` ตัวอักษร `#065F46`

---

## Modules (10 Modules Total)

### 1. Dashboard
- Real-time statistics & charts
- Advanced global search
- Role-based data visibility

### 2. Application Hub
- Aggregated application links
- Instant search with filter
- Pin/unpin favorites per user

### 3. Intranet
- News & announcements (CRUD)
- Organization calendar
- Subscribe/notification system

### 4. Chat
- Real-time messaging (WebSocket / Server-Sent Events)
- Emoji reactions, file uploads
- Message search

### 5. Book Meeting
- Room booking with calendar view
- Microsoft Teams integration
- Double-booking prevention

### 6. Documents
- Three-tier storage: Central Pool, Department Pool, Personal Pool
- Upload/download with permission control
- Full audit trail

### 7. Projects
- Kanban board (drag & drop)
- Progress tracking with milestones
- Multi-step approval workflow

### 8. Users & Roles
- RBAC with 6 roles (see below)
- Active Directory sync (≤15 minute interval)
- CSV bulk import/export

### 9. Audit Log
- Immutable activity log
- CSV export
- Filterable by user, action, module, date

### 10. System Configuration
- Authentication settings
- Branding (logo, colors)
- Storage configuration
- API key management

---

## User Roles (RBAC)

| Role         | Access Level                                              |
|--------------|-----------------------------------------------------------|
| Super Admin  | Full system access, all modules, API keys, user management<br/>เพิ่ม/ลบ Application (URL, Icon, ชื่อ), สร้างกลุ่ม Application, จัดการกลุ่มผู้ใช้งาน, กำหนดสิทธิ์ Dashboard |
| System Admin | System care, user management, AD Sync, audit, documents<br/>เพิ่ม/ลบ Application (URL, Icon, ชื่อ), สร้างกลุ่ม Application, จัดการกลุ่มผู้ใช้งาน, กำหนดสิทธิ์ Dashboard |
| Dean         | ดูข้อมูล Dashboard ได้ทั้งหมด, reports, project approval, chat, room booking |
| Dept Admin   | ดูข้อมูลในส่วนของแผนกตนเองเท่านั้น, department announcements, chat rooms, docs |
| User         | แสดงรายการ Application ตามสิทธิ์, แสดงตารางนัดหมายจากปฏิทิน M365, update ข้อมูล Dashboard ตามสิทธิ์ (auto-refresh หลังบันทึก), จัดเก็บข้อมูลรายเดือน (แก้ไขย้อนหลังได้), chat, meeting book, document upload, projects |
| Viewer       | Read-only: dashboard, announcements, projects, documents   |

**Implementation:** Store roles in JWT. Protect API routes with role-check middleware. Protect pages with layout-level auth checks.

---

## Authentication & Security

- **Primary Auth:** Microsoft SSO via Azure AD
- **Fallback:** Credentials Provider with hashed passwords (Argon2/Bcrypt)
- **MFA:** Enforced for System Admin and above
- **Session:** JWT with configurable timeout
- **API Security:** JWT validation on every API route
- **Encryption:** TLS/HTTPS only in production
- **Audit:** Immutable log — append-only, no deletes

---

## Database Principles

- Primary key: `id` as UUID (`@default(uuid())`)
- Timestamps on every table: `createdAt`, `updatedAt`
- Soft delete where appropriate (`deletedAt`)
- Audit fields: `createdBy`, `updatedBy`
- Use Prisma enums for fixed sets (roles, statuses, etc.)
- Index on frequently queried columns

---

## API Design

```typescript
// Standard success response
{ success: true, data: T, meta?: { total, page, limit } }

// Standard error response
{ success: false, error: { code: string, message: string } }
```

- Pagination via `?page=&limit=` query params
- Rate limiting on auth endpoints
- All mutations return the updated resource

---

## Development Workflow

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run lint     # ESLint check
npx prisma generate   # Generate Prisma client
npx prisma db push    # Push schema to DB
```

### Before Coding
1. Check `node_modules/next/dist/docs/` for any Next.js 16 breaking changes
2. Read relevant shadcn/ui component docs
3. Ensure Prisma schema is up-to-date

---

## Non-Functional Requirements

| Metric           | Target                |
|------------------|-----------------------|
| Response Time    | < 3 seconds           |
| Concurrent Users | ≥ 300                 |
| SLA              | ≥ 99.5%               |
| Server Location  | Thailand (data sovereignty) |
| MFA              | Required for Admin+   |
| AD Sync Interval | ≤ 15 minutes          |
| Warranty         | 1 year (Critical: ≤3 days, Other: ≤7 days) |