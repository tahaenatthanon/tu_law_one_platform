"use client";

import RequireRole from "@/components/shared/require-role";

export default function DocumentsPage() {
  return (
    <RequireRole roles={["super_admin", "system_admin", "dean", "dept_admin", "user"]}>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Documents</h1>
        <p className="text-sm text-[#6B7280] mt-1">จัดเก็บเอกสาร 3 ระดับ — ส่วนกลาง, ฝ่าย, ส่วนตัว</p>
      </div>
    </RequireRole>
  );
}
