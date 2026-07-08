@AGENTS.md

> ⚠️ **Critical Rule:** ห้ามลบไฟล์ `tor.txt`, `plan.txt`, `claude.md` ไม่ว่ากรณีใดๆ ทั้งสิ้น

# TU LAW ONE PLATFORM (TOP)

## 1. Project Identity

| | |
|---|---|
| **Name** | TU LAW ONE PLATFORM (TOP) |
| **Description** | ระบบศูนย์กลางดิจิทัลสำหรับคณะนิติศาสตร์ มหาวิทยาลัยธรรมศาสตร์ (Digital Central Platform for Faculty of Law, Thammasat University) |
| **Goal** | รวมระบบทั้งหมดไว้ในแพลตฟอร์มเดียว ลดการ Login หลายระบบ เพิ่มประสิทธิภาพการทำงาน รองรับ Real-time และเพิ่มความปลอดภัยของข้อมูล |

---

## 2. Technology Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | **Next.js 16+** (App Router, Turbopack) | Turbopack is the default bundler for `dev` and `build` |
| Language | **TypeScript 5** (strict mode) | No implicit `any` |
| UI Framework | **shadcn/ui** + **Tailwind CSS 4** | Utility-first, no custom CSS unless unavoidable |
| Backend | Next.js Route Handlers (`app/api/**/route.ts`) | No external backend service |
| Authentication | **Auth.js v5** (formerly NextAuth.js) — Credentials Provider + JWT | Config split: `auth.config.ts` (edge-safe) + `auth.ts` (full, with Prisma adapter) |
| Request Interception | **`proxy.ts`** (Next.js 16 rename of `middleware.ts`) | Runs on Node.js runtime; used for route/auth gating |
| ORM | **Prisma ORM 7** | Rust-free client, config lives in `prisma.config.ts` |
| Database | PostgreSQL | |
| API Style | REST API | JSON, standard envelope (see §14) |
| Package Manager | npm | |
| Version Control | Git + GitHub | |

> **Version discipline:** Always follow the stack above. Do not introduce a different framework, ORM, auth library, icon set, or CSS approach without explicit approval. If official docs for the pinned version conflict with older training knowledge, trust the current docs.

> **`proxy.ts` vs `middleware.ts`:** This project targets Next.js 16+, where `middleware.ts` is deprecated in favor of `proxy.ts` (Node.js runtime, exported function named `proxy`). Use `proxy.ts` everywhere in this codebase and in all new code/examples. Never mix the two conventions in the same project.

---

## 3. Folder Structure

```
TU-LAW-oneplatform/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── login/
│   │   └── layout.tsx
│   ├── (dashboard)/               # Protected route group
│   │   ├── dashboard/
│   │   ├── application-hub/
│   │   ├── intranet/
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
├── components/
│   ├── ui/                       # shadcn/ui primitives (do not hand-edit generated parts)
│   ├── layouts/                  # Shell, sidebar, header, page containers
│   ├── forms/                    # Form components (React Hook Form + Zod)
│   ├── tables/                   # Data table components
│   └── shared/                   # Shared/reusable presentational components
├── lib/
│   ├── auth.config.ts            # Auth.js edge-safe config (providers, callbacks, pages)
│   ├── auth.ts                   # Auth.js full config (Prisma adapter) + auth()/signIn/signOut
│   ├── prisma.ts                 # Prisma client singleton
│   ├── validations/              # Zod schemas, one file per domain
│   └── utils.ts                  # Helper functions
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Seed script (run explicitly, no longer automatic)
├── hooks/                        # Custom React hooks
├── types/                        # Shared TypeScript type definitions
├── proxy.ts                      # Next.js Proxy (auth guard, replaces middleware.ts)
├── prisma.config.ts              # Prisma 7 configuration (connection, seed command)
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts
```

---

## 4. AI Coding Rules

These rules govern how Claude (or any AI assistant) should write code in this repository.

### 4.1 General Coding Rules
- Always create reusable components; never duplicate UI markup across pages.
- Prefer composition over repetition — extract shared patterns into a component or hook.
- Split large files into smaller components; keep components **under ~300 lines** when practical.
- Use TypeScript strictly: no `any`, explicit types on all function params/returns, `type` for unions/intersections, `interface` for object shapes.
- Prefer `const` over `let`; never use `var`.
- Co-locate a component's types with the component unless shared across modules (then move to `types/`).
- Apply role-based rendering automatically on every screen/component (see §19.1) — this is a default requirement, not an opt-in feature.

### 4.2 File Naming
- Files: `kebab-case.tsx`, `kebab-case.ts`
- Components: `PascalCase` (filename matches the component/export name)
- Route folders: `kebab-case`
- API routes: `app/api/[resource]/route.ts`

### 4.3 React / Next.js
- Use **Server Components** by default; add `"use client"` only when the component needs interactivity, hooks, or browser APIs.
- Use **Route Handlers** (`app/api/`) for all API endpoints — no external backend.
- Use **`proxy.ts`** for authentication gating (not `middleware.ts`).
- Use **Server Actions** for simple mutations where they simplify data flow; prefer Route Handlers for complex or externally-consumed APIs.
- Use `Suspense` boundaries and `loading.tsx` for streaming/loading UI.
- Use `error.tsx` for route-level error boundaries; never let a raw error crash the page.

### 4.4 Styling
- Tailwind CSS utility classes only — no inline `style={{ }}`, no hardcoded CSS files beyond `globals.css` theme tokens.
- Use shadcn/ui components for all standard UI patterns.
- Support Thai language throughout (font: **Prompt**).

### 4.5 Never Do
- Never redesign the design system.
- Never invent new colors outside the defined palette.
- Never use another font besides Prompt.
- Never replace Lucide icons with another icon set.
- Never use another component library alongside shadcn/ui.
- Never mix different UI styles (e.g., neumorphism, glassmorphism) into a flat-design system.
- Never create inconsistent spacing — always use the defined spacing scale.
- Never reduce accessibility to achieve a visual effect.
- Never use `middleware.ts` and `proxy.ts` together — pick `proxy.ts` only.
- Never expose raw system/database errors to end users.
- Never use `any` to bypass a type error.

### 4.6 Safe Refactoring Rules

See **§5. Safe Project Refactoring Rules** — applies to every refactor, reorganize, modernize, optimize, improve, or clean-up request, and takes priority over implementation preferences.

---

## 5. Safe Project Refactoring Rules

> When asked to refactor, reorganize, modernize, optimize, improve, or clean up any part of the project, ALWAYS follow these rules unless explicitly instructed otherwise. These rules take priority over implementation preferences.

### 5.1 Primary Goal

Improve maintainability, readability, code quality, UI/UX, and project organization while preserving all existing functionality. The application should behave exactly the same after refactoring unless the user explicitly requests behavior changes.

### 5.2 NEVER Modify

Do NOT modify any of the following unless explicitly instructed by the user.

**Business**
- Business Logic
- Business Rules
- Existing Features
- User Workflows
- Permission Logic

**Authentication & Authorization**
- Authentication
- Authorization
- RBAC
- Session Logic
- Login Flow
- Logout Flow

**Database**
- Database Schema
- Prisma Models
- Database Structure
- Database Relationships
- Migrations
- Seed Data

**Backend**
- API Endpoints
- API Contracts
- Route Handlers
- Server Actions
- Middleware / Proxy (`proxy.ts`)
- Validation Rules
- Data Fetching Logic
- Response Structure

**Infrastructure**
- Environment Variables
- Security Configuration
- Deployment Configuration
- Build Configuration

**Routing**
- Route Structure
- Route Names
- Navigation Logic

**Behavior**
- Application Behavior
- Existing User Experience
- Existing Functionality

### 5.3 You MAY Improve

**UI**
- Layout
- Visual Hierarchy
- Typography
- Colors (within the Design System — §6)
- Spacing
- Icons
- Component Styling
- Responsive Design

**UX**
- Accessibility
- Readability
- Navigation
- User Feedback
- Loading States
- Empty States
- Error States
- Success States

**Code Quality**
- Folder Organization
- Component Structure
- Code Readability
- Naming Consistency
- Type Safety
- Shared Utilities
- Custom Hooks
- Reusable Components

**Performance**

Performance improvements are allowed **only** when application behavior remains identical.

### 5.4 UI Refactoring Rules

When improving UI:
- Follow the existing Design System (§6) exactly.
- Follow HCI principles (§8).
- Follow UX best practices.
- Follow WCAG AA accessibility guidelines (§11).
- Keep layouts consistent.
- Improve readability, information hierarchy, responsiveness, spacing consistency, and component reuse.

Never redesign the application unless explicitly requested.

**UI improvement scope:** UI improvement means enhancing existing screens — layout refinements, spacing adjustments, typography polish, and color tweaks within the Design System (§6). Do **not** replace the overall information architecture, navigation structure, or user workflow without explicit approval. When in doubt, ask.

### 5.5 Component Rules

**Always prefer:** shadcn/ui components · Tailwind CSS · Lucide React icons · TypeScript · reusable components.

**Avoid:** duplicate components · duplicate styling · inline CSS/styles · custom icon libraries · hardcoded values.

### 5.6 Required Behavior

**Always preserve:** existing features, existing behavior, existing API responses, existing database structure, existing user workflows.

**Never:**
- Remove features because they appear unused.
- Remove API endpoints.
- Remove permissions.
- Remove validation.
- Remove business rules.
- Rename routes without updating all references.
- Introduce breaking changes.

### 5.7 Logic Change Policy

If any improvement requires changing business logic, the database, authentication, authorization, API contracts, validation, existing features, or application behavior, you **MUST**:

1. Stop immediately.
2. Explain why the change is required.
3. Describe the expected impact.
4. Ask for user confirmation.
5. Do not continue until approval is received.

Never assume permission to modify application logic.

### 5.8 Large Project Refactoring

When refactoring the entire project, work in phases:

**Phase 1 — Analyze (no code changes)**
- Analyze the entire project.
- Identify duplicated code.
- Identify inconsistent UI.
- Identify structural improvements.
- Create a refactoring plan.

**Phase 2 — Present the plan (wait for approval)**
- Files to modify
- Components to split
- Components to merge
- Folder changes
- Estimated impact
- Risks

**Phase 3 — Refactor incrementally**, one module at a time, in this suggested order:
1. Shared Components
2. Layout
3. Dashboard
4. Feature Modules
5. Forms
6. Tables
7. Dialogs
8. Utility Components

Avoid modifying the entire project in one iteration.

### 5.9 Verification Checklist

Before completing any refactoring, verify:
- Existing functionality is unchanged.
- No API behavior has changed.
- No database behavior has changed.
- No authentication behavior has changed.
- No authorization behavior has changed.
- No routing behavior has changed.
- No permissions have changed.
- No validation has changed.
- No features have been removed.

**UI Verification:**
- Consistent Design System
- Responsive Layout
- Readable Typography
- Proper Spacing
- Consistent Icons
- Accessible Components
- Keyboard Navigation
- Loading States
- Empty States
- Error States
- Success States
- Role-based visibility unchanged or correctly improved (§19.1) — no role gained or lost access to UI it shouldn't have

### 5.10 Decision Priority

When multiple solutions exist, prioritize in this order:

1. Preserve Functionality
2. Preserve User Experience
3. Maintainability
4. Readability
5. Reusability
6. Performance
7. Visual Improvements

Behavior preservation is ALWAYS more important than architectural perfection.

### 5.11 Final Rule

Unless the user explicitly requests otherwise: **refactor the code, not the application's behavior.** Improve the implementation. Do NOT change what the application does. When in doubt, ask before making behavior-changing modifications.

---

## 6. Design System

### 6.1 Brand Identity
- **Brand:** คณะนิติศาสตร์ มหาวิทยาลัยธรรมศาสตร์ (Faculty of Law, Thammasat University)
- **Design Style:** Flat Design — no gradients, shadows, or glassmorphism except where explicitly listed below (e.g., the announcement banner). Solid colors and crisp borders only.
- **Font:** Prompt (Google Font) — full Thai + Latin support, via `--font-prompt`. Do not import other fonts.
- **Proportion:** 60-30-10 color rule | WCAG AA compliant throughout.

### 6.2 Color Palette (CSS variables — defined in `app/globals.css`)

| Role | Variable | Hex | Usage |
|---|---|---|---|
| **Primary** (Yellow — มธ.) | `--tu-primary` | `#FDB813` | Primary buttons, active state, highlights |
| Primary Light | `--tu-primary-light` | `#FFF3CD` | Hover backgrounds, badges |
| Primary Dark | `--tu-primary-dark` | `#E5A800` | Hover/pressed state |
| **Secondary** (Red — นิติศาสตร์) | `--tu-secondary` | `#A31D1D` | Headings, links, emphasis |
| Secondary Light | `--tu-secondary-light` | `#FCE4E8` | Error backgrounds |
| Secondary Dark | `--tu-secondary-dark` | `#8B1515` | Sidebar, dark surfaces, alt primary buttons |
| **Text Primary** | `--tu-text-primary` | `#1A1A2E` | Body text, headings |
| Text Secondary | `--tu-text-secondary` | `#6B7280` | Subtext, labels |
| Text Muted | `--tu-text-muted` | `#9CA3AF` | Placeholder, disabled |
| Text Inverse | `--tu-text-inverse` | `#FFFFFF` | Text on dark backgrounds |
| **Background** | `--tu-bg` | `#FFFFFF` | Main background |
| Surface | `--tu-surface` | `#F5F5F5` | Card backgrounds, containers |
| Surface Alt | `--tu-surface-alt` | `#FAFAFA` | Alternate surface |
| **Border** | `--tu-border` | `#E5E7EB` | Default border |
| Border Dark | `--tu-border-dark` | `#D1D5DB` | Stronger border |
| **Dark Background** | `--tu-dark-bg` | `#1A1A2E` | Sidebar, dark sections |
| Dark Surface | `--tu-dark-surface` | `#252540` | Dark surface variant |

**Status Colors**

| Status | Variable | Hex |
|---|---|---|
| Success | `--tu-success` / `--tu-success-light` | `#28A745` / `#D4EDDA` |
| Warning | `--tu-warning` / `--tu-warning-light` | `#FDB813` / `#FFF3CD` |
| Error | `--tu-error` / `--tu-error-light` | `#A31D1D` / `#FCE4E8` |
| Info | `--tu-info` / `--tu-info-light` | `#4A90D9` / `#D6E9F8` |

> **Design Token Rule:** Always prefer CSS variables over raw hex values when referencing theme colors: `text-[var(--tu-text-primary)]`, `bg-[var(--tu-primary)]`, `border-[var(--tu-border)]`. Use raw hex values (`#FDB813`, `#1A1A2E`) only when defining new theme tokens in `globals.css`. This keeps the codebase maintainable — a single variable change propagates everywhere. Never approximate with a default Tailwind palette color.

### 6.3 Typography

Font: Prompt (`--font-prompt`).

| Level | Classes |
|---|---|
| H1 (Page Title) | `text-3xl font-bold text-[#1A1A2E]` |
| H2 (Subtitle) | `text-base font-semibold text-[#A31D1D]` |
| H3 (Section Title) | `text-sm font-bold text-[#1A1A2E]` |
| Body Text | `text-sm text-[#1A1A2E]` |
| Secondary Text | `text-xs text-[#6B7280]` |

Maintain a clear visual hierarchy; every screen must remain easy to scan and read.

### 6.4 Layout Primitives

**Cards**
`bg-white border border-[#D1D5DB] rounded-lg shadow-none p-6` — no heavy shadows or decoration.

**Sidebar**
`bg-[#8B1515] text-white`. Active item: `bg-[#FDB813] text-[#1A1A2E]`. Use yellow accents for icons/indicators.

**Announcement Banner**
`bg-gradient-to-r from-[#8B1515] to-[#A31D1D] border-l-4 border-[#FDB813]` (the one intentional exception to the flat/no-gradient rule).

**Buttons**
- Primary: `bg-[#FDB813] text-[#1A1A2E] hover:brightness-95 active:brightness-90 rounded-md transition-colors duration-200`
- Secondary: `bg-white border border-[#D1D5DB] text-[#1A1A2E] hover:bg-gray-50 rounded-md transition-colors duration-200`
- Disabled: `bg-gray-200 text-gray-500 cursor-not-allowed`

**Input Fields**
`border border-[#D1D5DB] bg-white text-[#1A1A2E] placeholder:text-gray-400 rounded-md focus:border-[#A31D1D] focus:ring-1 focus:ring-[#A31D1D]`

**Badges**
- Success: `bg-green-100 text-green-700`
- Warning: `bg-yellow-100 text-yellow-700`
- Error: `bg-red-100 text-red-700`

**Spacing**
- Page padding: `px-6 py-6`
- Section spacing: `gap-6`
- Card padding: `p-6`

**Active / Selected State**
`bg-[#FDB813] text-[#1A1A2E]` for active navigation, selected cards, active tabs, selected filters.

**Icons**
Lucide React only. Always pair icons with text labels where the meaning isn't obvious from the icon alone. Keep sizing consistent (e.g. `size-4` inline, `size-5` in nav).

**Animation**
Keep motion subtle: `transition-colors duration-200` or `transition-all duration-200`. Avoid unnecessary or decorative animation.

### 6.5 Theme Configuration (Database-driven)

```prisma
model ThemeSetting {
  id           String   @id @default(uuid())
  primaryColor String   // e.g. #FDB813
  logoUrl      String?  // Uploaded logo URL
  updatedAt    DateTime @updatedAt
}
```

Admins can change `primaryColor` and `logoUrl` via Settings → applies system-wide immediately.

---

## 7. Component Standards & shadcn Rules

### 7.1 shadcn Rules
- Use shadcn/ui as the **only** component library. Do not add Material UI, Ant Design, Chakra, etc.
- Install components via the shadcn CLI; do not hand-write a component that shadcn already provides.
- You may edit generated shadcn component files under `components/ui/` for theming, but keep the public API (props) compatible with upstream so future `shadcn add --overwrite` updates stay safe.
- Compose shadcn primitives into feature components under `components/forms`, `components/tables`, `components/shared` — don't scatter raw shadcn usage across every page.

### 7.2 Standard Component Set

Use these shadcn/ui primitives as the baseline vocabulary for all UI:

`Button` · `Input` · `Select` · `Dialog` · `Sheet` · `DropdownMenu` · `Popover` · `Tooltip` · `Table` · `Card` · `Badge` · `Tabs` · `Accordion` · `Alert` · `Toast (Sonner)` · `Skeleton` · `Pagination` · `Breadcrumb` · `Form` (with React Hook Form) · `Checkbox` · `RadioGroup` · `Switch` · `Textarea` · `Avatar` · `Separator`

### 7.3 Icons
- Use **Lucide React** exclusively.
- Do **not** use: Heroicons, FontAwesome, Material Icons, Bootstrap Icons, or inline custom SVG unless no Lucide equivalent exists (and then, document why).

### 7.4 Component Quality Bar
- Reusable, modular, and maintainable.
- No duplicate UI patterns — if two pages need the "same-ish" table or card, extract one shared component with props.
- Consistent spacing, sizing, and interaction patterns across the whole app.
- Every component that renders a list, table, or async data must handle loading, empty, and error states (see §10).

---

## 8. HCI & UX Principles

Always design following established Human-Computer Interaction (HCI), UX, and Accessibility best practices. Prioritize usability over visual decoration; every interface should be intuitive, predictable, and easy to learn, minimizing clicks for common tasks.

### 8.1 Usability Heuristics (Nielsen)

1. **Visibility of System Status** — always give feedback for user actions; show loading, success, warning, and error states.
2. **Match Between System and the Real World** — use familiar language, avoid unnecessary jargon.
3. **User Control and Freedom** — provide Back, Cancel, Close, Undo where appropriate; never trap users inside a dialog.
4. **Consistency and Standards** — keep layouts, colors, buttons, icons, spacing, and terminology consistent; don't redesign the same component differently per page.
5. **Error Prevention** — validate forms before submission; confirm destructive actions.
6. **Recognition Rather Than Recall** — make important actions visible; use search/filters/breadcrumbs instead of requiring users to remember information.
7. **Flexibility and Efficiency of Use** — support shortcuts for frequent tasks; surface recently used items/favorites where relevant.
8. **Aesthetic and Minimalist Design** — show only relevant information; remove clutter.
9. **Help Users Recover from Errors** — error messages explain the problem and the fix; never show raw system errors.
10. **Help and Documentation** — provide contextual help where needed, kept concise.

### 8.2 Content Organization

Typical page structure, top to bottom:
1. Page Header
2. Summary / stat cards (if applicable)
3. Search
4. Filters
5. Main content
6. Detail panel / sidebar (if applicable)

Group related information into clearly separated sections; avoid long unstructured scrolling pages.

### 8.3 Interaction Design
- Every clickable element has hover, active, and focus states.
- Buttons clearly communicate their action (label, not just an icon, for anything destructive or non-obvious).
- Destructive actions require confirmation.
- Loading states appear immediately, not after a delay.
- Empty states guide users toward the next action.

### 8.4 Enterprise UX Reference
Design like modern enterprise software (Microsoft 365, Google Workspace, Atlassian, Notion): clean, professional, information-focused, functional, consistent. Avoid unnecessary gradients, excessive shadows, oversized components, decorative animation.

---

## 9. UX Checklist

Before generating any UI, verify:

- ✓ Readable typography and clear hierarchy
- ✓ Proper, consistent spacing
- ✓ Fully responsive (desktop / tablet / mobile)
- ✓ WCAG AA contrast and semantics
- ✓ Empty state
- ✓ Loading state
- ✓ Error state
- ✓ Success state
- ✓ Hover state
- ✓ Focus state
- ✓ Active state
- ✓ Full keyboard navigation
- ✓ Role-based visibility applied — see §19.1 (navigation, actions, and data shown match the current user's role; nothing unauthorized is visible)

---

## 10. HCI Checklist

Every data-driven page must include, where applicable:

- ✓ Search
- ✓ Filter (if the dataset warrants it)
- ✓ Pagination
- ✓ User feedback (toast/alert on action result)
- ✓ Confirmation dialog for destructive actions
- ✓ Breadcrumb
- ✓ Empty state with a clear next action
- ✓ Help text for non-obvious fields or actions
- ✓ Role-appropriate actions only (edit/delete/approve/export buttons hidden for roles that cannot perform them — see §19.1)

---

## 11. Accessibility (WCAG AA)

Design for accessibility by default, not as an afterthought.

- Meet WCAG AA color contrast requirements (4.5:1 for normal text, 3:1 for large text/UI components).
- **Minimum touch target:** 44×44px for any interactive element.
- **Minimum font size:** 14px for body text.
- Support full keyboard navigation; provide visible focus states (never `outline: none` without a replacement).
- Use semantic HTML (`<button>`, `<nav>`, `<table>`, headings in order — not `<div>` soup).
- Pair icons with text labels wherever the icon alone is ambiguous.
- Never rely on color alone to communicate meaning (pair with icon/text, e.g. status badges).
- Provide `alt` text for meaningful images; mark decorative images `alt=""`.
- Ensure form fields have associated `<label>`s, not just placeholders.

---

## 12. Next.js Best Practices

- Use the **App Router** exclusively; do not introduce Pages Router code.
- Use **`proxy.ts`** (not `middleware.ts`) for request-time auth gating; keep it edge-light — import only `auth.config.ts`, never the full `auth.ts` (which pulls in the Prisma adapter and Node-only APIs).
- Prefer **Server Components** for data fetching; fetch data where it's used instead of prop-drilling from a client root.
- Use `loading.tsx` + `Suspense` for streaming UI, and `error.tsx` for route-level error boundaries.
- Use **Server Actions** for straightforward form mutations; use Route Handlers when the endpoint needs to be called from outside the page (webhooks, external clients, complex query params).
- Co-locate route-specific components in the route's folder; only promote to `components/shared` once reused.
- Use `next/image` for all images; avoid unnecessary client components just to render a static image.
- Keep environment variables validated (e.g. via a `lib/env.ts` Zod schema) rather than accessed ad hoc via `process.env` throughout the codebase.
- Check the installed Next.js version's release notes before relying on any API — file conventions and defaults have changed across recent majors (e.g. the `middleware` → `proxy` rename).

---

## 13. Prisma Rules

- Single Prisma Client instance via `lib/prisma.ts` (singleton pattern to avoid exhausting connections in dev/hot-reload).
- Schema lives in `prisma/schema.prisma`; connection and CLI behavior are configured in `prisma.config.ts` (Prisma 7 no longer reads DB URL from the schema file alone).
- Business entities should include: `id` as UUID (`@id @default(uuid())`), `createdAt`, `updatedAt` timestamps. Exceptions: many-to-many join tables, temporary/staging tables, system-generated tables.
- Use soft delete (`deletedAt DateTime?`) where records must be recoverable or audit-preserved; hard delete only for genuinely transient data.
- Include audit fields (`createdBy`, `updatedBy`) on business-critical tables.
- Use Prisma `enum` for fixed value sets (roles, statuses, etc.) instead of free-text strings.
- Add indexes on frequently queried/filtered columns and all foreign keys used in `WHERE`/`ORDER BY`.
- Seeding is **not automatic** in Prisma 7 — run `prisma db seed` explicitly; never assume `migrate dev` seeds the database.
- Run `npx prisma generate` after every schema change, and commit the migration alongside the code that depends on it.
- Never run destructive commands (`migrate reset`, `db push --force-reset`) against a shared or production database.

---

## 14. API Standards

```typescript
// Standard success response (single item)
{ success: true, data: T }

// Standard success response (paginated list)
{ success: true, data: T[], meta: { page: number; limit: number; total: number; totalPages: number } }

// Standard error response
{ success: false, error: { code: string; message: string } }
```

- Pagination via `?page=&limit=` query params (default `page=1&limit=20`); return `meta.total` and `meta.totalPages` for client-side pagination UI.
- Validate every request body/query with Zod before touching the database.
- Rate limit authentication endpoints.
- All mutations return the updated resource in `data`.
- Use proper HTTP status codes (400 validation, 401 unauthenticated, 403 unauthorized, 404 not found, 409 conflict, 500 unexpected).
- Never leak stack traces, SQL, or internal error messages in the `error.message` sent to the client — log details server-side, return a safe message.

---

## 15. Security

- **Primary Auth:** Microsoft SSO via Azure AD.
- **Fallback:** Credentials Provider with hashed passwords (Argon2 or Bcrypt) — never store plaintext or reversibly-encrypted passwords.
- **MFA:** Enforced for System Admin and above.
- **Session:** JWT with a configurable timeout; keep secrets in `AUTH_SECRET` (Auth.js v5 env convention), never hardcoded.
- **API Security:** Validate the JWT/session on every API route and Server Action that touches non-public data — don't rely on `proxy.ts` route matching alone (per CVE-2025-29927, header-spoofing has previously bypassed middleware-only protection; always re-check auth inside the handler too).
- **Encryption:** TLS/HTTPS only in production; no plaintext transport.
- **Audit:** Immutable audit log — append-only, no deletes or updates to historical entries.
- **Input handling:** Validate and sanitize all user input server-side (never trust client-side validation alone); use parameterized queries (Prisma does this by default — never drop to raw SQL string concatenation).
- **Secrets:** All credentials/API keys via environment variables, never committed to the repo.
- **File uploads:** Restrict file types/sizes; scan or validate before storage; enforce the three-tier permission model (Central / Department / Personal pools).

---

## 16. Dashboard / Table / Form Standards

### 16.1 Dashboard Rules
Every dashboard should contain:
- Key statistics (stat cards)
- Charts/visualizations for trends
- Recent activity feed
- Quick actions
- Notifications
- Announcements
- Stat cards, charts, and quick actions filtered by the viewer's role (§19.1) — e.g. a `Viewer` sees data widgets but no "Create/Manage" quick actions

### 16.2 Data Table Rules
Every data table must support:
- Search
- Sort
- Filter
- Pagination
- Export (CSV, where relevant to the module) — export control itself respects role (§19.1)
- Column visibility toggle (for wide tables)
- Responsive overflow (horizontal scroll container on small screens, never a broken layout)
- Row actions (edit/delete/approve) rendered per row based on the viewer's role and the row's ownership/state

### 16.3 Form Rules
Every form must include:
- Client + server validation (Zod schema shared where possible)
- Required-field indicators
- Inline error messages next to the offending field
- Loading state on the submit button (disabled + spinner) during submission
- Success feedback (toast or inline message) on completion
- A Cancel action that returns the user to the prior context without losing unrelated state
- Fields the viewer's role cannot edit rendered as read-only or omitted (§19.1) — never left editable with only a server-side rejection as feedback

---

## 17. Enterprise Guidelines

Design for enterprise users, not consumer/marketing users. Prioritize:
- **Fast scanning** — dense but organized layouts, clear headings, predictable positions for repeated elements.
- **Low cognitive load** — progressive disclosure, sensible defaults, minimal required decisions per screen.
- **Information density** — enterprise users prefer seeing more at once over excessive whitespace, but never at the cost of readability or touch targets.
- **Professional appearance** — flat design, restrained color use, no marketing-style visuals.
- **Business workflows** — model screens around the actual task sequence (approve → notify → archive, etc.), not just CRUD forms.

### Readability
Prioritize readability over visual effects: clear typography, sufficient spacing, strong visual hierarchy, short paragraphs, grouped related content, high contrast.

### Responsive Design
Every page must be fully responsive:
- Desktop: 3–4 columns
- Tablet: 2 columns
- Mobile: 1 column

Avoid horizontal scrolling except inside explicitly scrollable table containers.

### Overall Goal
Every interface should feel modern, intuitive, accessible, efficient, and easy to use while maintaining visual and behavioral consistency across the entire TU LAW ONE PLATFORM.

---

## 18. Platform Modules

> Scope derived from TOR (Terms of Reference) §2.1 — the system must fully implement all 9 modules below with the specified functional scope. Numbers (counts, thresholds, timeframes) are contractual requirements, not suggestions — do not reduce them without explicit approval.

### 18.1 Dashboard
- Real-time organizational overview, with the last data-sync date/time always visible.
- Department-specific dashboards for **at least 3 departments**: IT, Academic, Support.
- **5 view modes**: Overview, Weekly, Trend, Proportion, Comparison.
- Advanced search: keyword, date range, and category.
- Latest important announcements shown in real time, with a "view all" link.

### 18.2 Application Hub
- Aggregated links to all faculty systems in one place, categorized by usage type.
- Real-time overview stats — **at least 4**: total systems, active users, systems online, systems under maintenance.
- Pin/unpin frequently used applications, shown separately from the full list.
- Real-time online/offline status indicator on each application icon.
- Instant search, with toggle between **Grid View** and **List View**.

### 18.3 Intranet
- News/announcements grouped into **at least 4 categories** — Urgent, Invitation, Result Announcement, Policy — each with a distinct color and icon.
- Monthly calendar view with color coding for **at least 5 event types**: Meeting, Seminar, Exam, Holiday, Deadline.
- Real-time organizational stats — **at least 4**: staff count, course count, research output count, current student count.
- Internal department directory: department name, phone, email, location.
- Subscribe to announcements by category or department, with in-app notifications on new posts.

### 18.4 Book Meeting
- Online booking for meeting rooms/venues — date, time, topic, and expected attendee count.
- Real-time list of all rooms with available/occupied status.
- Automatic **double-booking prevention**, with immediate notification if a room is already booked.
- Confirm/cancel bookings through the system, with automatic notifications.
- **Microsoft Teams Meeting** integration for online meetings; booking history view.

### 18.5 Documents
- Three-tier storage: **Central Pool** (public documents), **Department Pool**, **Personal Pool** (max **5 GB per user**).
- Simultaneous multi-file upload: **PDF, XLSX, PPTX, DOCX, PNG, JPG**.
- Document list with filename, type, size, uploader, and last-modified date/time.
- Role-based pool access: **Super Admin / System Admin** → all pools · **Dept Admin** → Central Pool + own Department Pool · **User** → Central Pool + own Personal Pool.
- Full audit trail on every access and edit; real-time storage-usage progress bar.

### 18.6 Projects
- Kanban board with **4 columns**: Planning, In Progress, Pending Approval, Completed — drag & drop between columns.
- Per-project progress bar (%), updatable by the project owner or an Admin.
- New-project form: name, type, objective, timeline, and member list.
- **At least 6 project types**: Academic, Curriculum, Seminar, Research, IT, Budget.
- Approval workflow restricted to **Dept Admin and above**, with a required reason on approval or rejection.

### 18.7 Users & Roles
- RBAC with **6 roles**: Super Admin, System Admin, Dean, Dept Admin, User, Viewer (see §19).
- Active Directory sync (**≤15 minute** interval) — AD changes must reflect in-platform within that window.
- Must display **at least 300 concurrent user accounts** with no performance degradation.
- Add users manually or via **CSV import**.
- Filter users by status — **at least 3 statuses**: Active, Inactive, MFA Pending.

### 18.8 Audit Log
- **Immutable** log — no user, including Super Admin, can edit, delete, or otherwise alter a recorded entry.
- **At least 8 event types**: `DOC_UPLOAD`, `CONFIG_UPDATE`, `PROJECT_APPROVE`, `AD_SYNC`, `USER_LOGIN`, `USER_LOGIN_FAILED`, `DASHBOARD_VIEW`, `ROLE_CREATE`.
- Each entry records: timestamp, actor, action type, description, IP address, and the actor's role at the time of the action.
- CSV export, filterable by date, event type, username, and IP address; retained for **at least 1 year**.

### 18.9 System Configuration
- Authentication settings: session timeout, JWT token expiry, max failed login attempts before lockout, and MFA enforcement toggle.
- LDAP URL configuration for Active Directory connectivity.
- UI & branding customization: logo, system name, primary theme color — changes apply **system-wide immediately**.
- Configurable max storage per user, allowed file types, and Projects module statuses/types.
- External API integration with API key management, access scoped by permission, and full access logging.

---

## 19. User Roles (RBAC)

| Role | Access Level |
|---|---|
| Super Admin | Full system access, all modules, API keys, user management |
| System Admin | System care, user management, AD Sync, audit, documents |
| Dean | Dashboard, reports, project approval, room booking |
| Dept Admin | Department dashboard, announcements, docs |
| User | Dashboard, meeting booking, document upload, projects |
| Viewer | Read-only: dashboard, announcements, projects, documents |

### Permission Matrix

| Role | Dashboard | App Hub | Intranet | Book Meeting | Documents | Projects | Users & Roles | Audit Log | Settings |
|---|---|---|---|---|---|---|---|---|---|
| **Super Admin** | All | All | All | All | All | All | All | Read | All |
| **System Admin** | All | All | All | Read | All | Read | Manage | Read | All |
| **Dean** | All | Read | All | All | Read | Approve | Read | — | — |
| **Dept Admin** | Dept | Read | Dept | Read | Manage Dept | Approve | — | — | — |
| **User** | Own | Read | Read | Create | Upload | Create | — | — | — |
| **Viewer** | Read | Read | Read | — | Read | Read | — | — | — |

> **Legend:** All = full CRUD · Manage = create/update/delete · Approve = review + approve/reject · Dept = department-scoped · Own = own data only · Read = view only · — = no access

**Implementation:** Store roles in the JWT. Protect API routes with role-check logic inside the handler (not solely in `proxy.ts`). Protect pages with layout-level auth checks (`auth()` in a Server Component layout).

### 19.1 Role-Based UI Rendering

> **Default behavior — always on.** Role-based rendering is applied **automatically to every screen and component generated**, whether or not the user explicitly asks for it. Do not wait for an instruction like "filter this by role" — treat role-awareness as a default requirement of any UI, the same way loading/empty/error states are (see §9, §23).

Every screen must render according to the current user's role — users should never see navigation, actions, or data they aren't permitted to use.

**Navigation & Layout**
- Sidebar/menu items render only for roles that have access to that module.
- Dashboard widgets, stat cards, and quick actions are filtered per role (e.g. `Viewer` sees no "Create" quick actions).
- Route groups not permitted for the current role must redirect or show a proper "Not Authorized" state — never a blank/broken page.

**Actions & Controls**
- Buttons/menu items for actions the role cannot perform (create, edit, delete, approve, export, manage users, etc.) are **hidden**, not just disabled — disable-only leaks the existence of an action without granting it, which is confusing UX for genuinely unauthorized users.
- Exception: when knowing an action *exists* is itself useful (e.g. "Approve" visible-but-disabled with a tooltip explaining who can approve), disable + explain instead of hiding — use judgment per workflow, but default to hiding.

**Tables & Data (see §16.2 Data Table Rules)**
- Row actions (edit/delete/approve) render per row based on both the row's ownership/state and the viewer's role.
- Column visibility and export options respect role (e.g. `Viewer` may see a table but not the Export button).

**Forms**
- Fields the role cannot edit render as read-only or are omitted, not just left enabled with a server-side rejection as the only feedback.

**Implementation pattern**
- Read the role from the session (`auth()`) in a Server Component and pass a derived permissions object down, or use a small `can(action, resource)` helper — don't scatter raw `role === "..."` checks across many components.
- Keep the permission source of truth on the server; client-side role checks are for UX/display only.

> ⚠️ **Security note:** Hiding UI elements by role is a UX improvement, not an access control mechanism. Every underlying API Route / Server Action must independently verify the user's role and permissions server-side (see §15 Security) — never assume that because a button is hidden, the action is safe from a direct API call.

---

## 20. Database Principles

- Primary key: `id` as UUID (`@default(uuid())`).
- Timestamps on every table: `createdAt`, `updatedAt`.
- Soft delete where appropriate (`deletedAt`).
- Audit fields: `createdBy`, `updatedBy`.
- Use Prisma enums for fixed sets (roles, statuses, etc.).
- Index frequently queried columns.

*(See §13 Prisma Rules for tooling-specific conventions.)*

---

## 21. Development Workflow

```bash
npm run dev            # Start dev server (Turbopack)
npm run build          # Production build
npm run lint           # ESLint check
npx prisma generate    # Generate Prisma client
npx prisma db push     # Push schema to DB (dev only)
npx prisma migrate dev # Create + apply a migration
npx prisma db seed     # Seed the database (not automatic in Prisma 7)
```

### Before Coding
1. Confirm the installed Next.js major version and check for breaking changes (e.g. `middleware` → `proxy`) before relying on any file convention.
2. Check whether a needed UI pattern already exists as a shadcn/ui component before building custom.
3. Ensure the Prisma schema and latest migration are in sync before writing queries against new fields.

---

## 22. Non-Functional Requirements

| Metric | Target |
|---|---|
| Response Time | < 3 seconds |
| Concurrent Users | ≥ 300 |
| SLA | ≥ 99.5% |
| Server Location | Thailand (data sovereignty) |
| MFA | Required for Admin+ |
| AD Sync Interval | ≤ 15 minutes |
| Warranty | 1 year (Critical: ≤3 days, Other: ≤7 days) |

---

## 23. AI Response Rules

Whenever generating UI or code for this project:

- Follow this document exactly; treat it as the source of truth over general training knowledge.
- Do not change the design language, color palette, font, or component library.
- Maintain consistency across all pages and modules.
- Reuse existing components whenever possible instead of creating near-duplicates.
- Apply the HCI, UX, UI, Accessibility, and Enterprise Dashboard principles above to every screen generated.
- Apply Role-Based UI Rendering (§19.1) automatically to every screen/component — filter navigation, actions, table rows, and form fields by the current user's role by default, without being asked each time.
- Prefer production-ready implementations over prototypes — include loading/empty/error states, validation, and accessibility by default, not as a follow-up.
- Think as a senior Full-Stack Developer, UX Designer, UI Designer, Business Analyst, and Solution Architect simultaneously.
- If a requirement conflicts with this document, ask for clarification instead of silently making assumptions.

---

## 24. Language Standard (UX Writing)

All user-facing UI text must be in **Thai** — the primary audience is Thai-speaking faculty staff.

**Use English only for:**
- Technical terms that have no widely accepted Thai equivalent (e.g. "LDAP", "JWT", "API Key")
- Product names (e.g. "Microsoft Teams", "Azure AD")
- API endpoint names and field keys

**Use Thai for all labels, buttons, messages, and help text:**

| English (avoid) | Thai (use) |
|---|---|
| Delete | ลบข้อมูล |
| Submit | ส่งข้อมูล |
| Cancel | ยกเลิก |
| Save | บันทึก |
| Edit | แก้ไข |
| Search | ค้นหา |
| Filter | กรอง |
| Export | ส่งออก |
| Approve | อนุมัติ |
| Reject | ไม่อนุมัติ |
| Confirm | ยืนยัน |
| Close | ปิด |

Prefer natural, user-friendly Thai wording over literal translations. Keep tone professional but warm — this is an internal faculty platform, not a government form.

---

## 25. Testing

Before completing any code changes, verify the build is clean:

```bash
npm run lint          # ESLint — fix all errors and warnings
npm run build         # Production build — must succeed with no errors
```

**For critical logic (auth, permissions, API endpoints, data mutations):**
- Add unit tests for permission edge cases (what each role can/cannot do)
- Test API responses for all HTTP status codes the endpoint can return
- Verify that unauthorized requests receive `401`/`403`, not `500`
- Test with different role tokens to confirm RBAC enforcement

**Before marking work complete:**
- `npm run lint` passes with zero errors
- `npm run build` succeeds
- No TypeScript errors remain (`tsc --noEmit`)
- All new API routes return the standard envelope (§14)
