"use client";

import RequireRole from "@/components/shared/require-role";

export default function SettingsPage() {
  return (
    <RequireRole roles={["super_admin", "system_admin"]}>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">ตั้งค่า</h1>
        <p className="text-sm text-[#6B7280] mt-1">ตั้งค่าระบบและบัญชีผู้ใช้</p>
      </div>
    </RequireRole>
  );
}
