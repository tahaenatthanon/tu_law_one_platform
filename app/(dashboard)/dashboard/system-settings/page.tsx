"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Lock, Palette, Folder, Key, Save, RotateCcw } from "lucide-react";

type SectionKey = "auth" | "branding" | "storage" | "api";

const SECTIONS: { key: SectionKey; label: string; icon: React.ReactNode }[] = [
  { key: "auth", label: "การยืนยันตัวตน", icon: <Lock className="size-4" /> },
  { key: "branding", label: "UI & แบรนด์", icon: <Palette className="size-4" /> },
  { key: "storage", label: "พื้นที่จัดเก็บ", icon: <Folder className="size-4" /> },
  { key: "api", label: "API Keys", icon: <Key className="size-4" /> },
];

const DEFAULTS = {
  sessionTimeout: "28800",
  jwtExpiry: "86400",
  maxLoginAttempts: "5",
  mfaEnabled: true,
  ldapUrl: "ldap://ad.tu.ac.th",
  systemName: "TULAW ONE PLATFORM",
  primaryColor: "#FDB813",
  secondaryColor: "#8B1515",
  logoUrl: "",
  maxStorageGb: "5",
  allowedFileTypes: "PDF, DOCX, XLSX, PPTX, PNG, JPG",
};

export default function SystemSettingsPage() {
  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as Record<string, unknown>)?.roles as string[] ?? [];
  const isAdmin = userRoles.some(r => ["super_admin", "system_admin"].includes(r));
  if (!isAdmin) return <div className="p-8 text-center text-[#A31D1D] text-sm">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</div>;

  const [section, setSection] = useState<SectionKey>("auth");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  // Auth state
  const [sessionTimeout, setSessionTimeout] = useState(DEFAULTS.sessionTimeout);
  const [jwtExpiry, setJwtExpiry] = useState(DEFAULTS.jwtExpiry);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(DEFAULTS.maxLoginAttempts);
  const [mfaEnabled, setMfaEnabled] = useState(DEFAULTS.mfaEnabled);
  const [ldapUrl, setLdapUrl] = useState(DEFAULTS.ldapUrl);
  // Branding state
  const [systemName, setSystemName] = useState(DEFAULTS.systemName);
  const [primaryColor, setPrimaryColor] = useState(DEFAULTS.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(DEFAULTS.secondaryColor);
  const [logoUrl, setLogoUrl] = useState(DEFAULTS.logoUrl);
  // Storage state
  const [maxStorageGb, setMaxStorageGb] = useState(DEFAULTS.maxStorageGb);
  const [allowedFileTypes, setAllowedFileTypes] = useState(DEFAULTS.allowedFileTypes);

  const handleSave = (sectionKey: SectionKey) => {
    setSaving(true);
    // Simulate API save
    setTimeout(() => {
      setMessage(`✅ บันทึกการตั้งค่า "${SECTIONS.find(s => s.key === sectionKey)?.label}" สำเร็จ`);
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }, 600);
  };

  const handleReset = (sectionKey: SectionKey) => {
    if (sectionKey === "auth") { setSessionTimeout(DEFAULTS.sessionTimeout); setJwtExpiry(DEFAULTS.jwtExpiry); setMaxLoginAttempts(DEFAULTS.maxLoginAttempts); setMfaEnabled(DEFAULTS.mfaEnabled); setLdapUrl(DEFAULTS.ldapUrl); }
    if (sectionKey === "branding") { setSystemName(DEFAULTS.systemName); setPrimaryColor(DEFAULTS.primaryColor); setSecondaryColor(DEFAULTS.secondaryColor); setLogoUrl(DEFAULTS.logoUrl); }
    if (sectionKey === "storage") { setMaxStorageGb(DEFAULTS.maxStorageGb); setAllowedFileTypes(DEFAULTS.allowedFileTypes); }
    setMessage("↩️ คืนค่าเริ่มต้นแล้ว");
    setTimeout(() => setMessage(""), 2000);
  };

  return (
    <div className="pt-0 px-6 pb-8">
      <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">ตั้งค่าระบบ</h1>
      <p className="text-sm text-[#6B7280] mb-6">จัดการการตั้งค่าระบบ — การยืนยันตัวตน แบรนด์ พื้นที่จัดเก็บ และ API Keys</p>

      {message && <div className={`p-3 mb-4 text-sm ${message.startsWith("✅") ? "bg-green-50 border border-green-300 text-green-700" : "bg-[#FCE4E8] border border-[#A31D1D] text-[#A31D1D]"}`}>{message}</div>}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="md:w-52 shrink-0 flex md:flex-col gap-0.5 overflow-x-auto">
          {SECTIONS.map(s => (
            <button key={s.key} onClick={() => setSection(s.key)}
              className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${section === s.key ? "bg-[#FDB813] text-[#1A1A2E]" : "text-[#6B7280] hover:bg-[#F5F5F5] hover:text-[#1A1A2E]"}`}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        {/* Content Panel */}
        <div className="flex-1 bg-white border border-[#D1D5DB] p-6 min-h-[400px]">
          {/* AUTH SECTION */}
          {section === "auth" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-[#1A1A2E]">การตั้งค่ายืนยันตัวตน</h3>
                <div className="flex gap-2">
                  <button onClick={() => handleReset("auth")} className="flex items-center gap-1 px-3 py-1.5 text-xs border border-[#D1D5DB] text-[#6B7280] hover:bg-gray-100"><RotateCcw className="size-3" /> คืนค่าเริ่มต้น</button>
                  <button onClick={() => handleSave("auth")} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800] disabled:opacity-50"><Save className="size-3" /> {saving ? "กำลังบันทึก..." : "บันทึก"}</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingsField label="Session Timeout (วินาที)" value={sessionTimeout} onChange={setSessionTimeout} hint="ระยะเวลาหมดอายุเซสชัน" />
                <SettingsField label="JWT Token Expiry (วินาที)" value={jwtExpiry} onChange={setJwtExpiry} hint="อายุของ JWT token" />
                <SettingsField label="ล็อกอินผิดสูงสุด (ครั้ง)" value={maxLoginAttempts} onChange={setMaxLoginAttempts} hint="จำนวนครั้งก่อนล็อกบัญชี" />
                <div className="border border-[#D1D5DB] p-3 flex items-center justify-between">
                  <div><p className="text-[10px] text-[#9CA3AF]">บังคับใช้ MFA สำหรับ Admin+</p><p className="text-sm font-medium text-[#1A1A2E] mt-0.5">{mfaEnabled ? "เปิดใช้งาน" : "ปิดใช้งาน"}</p></div>
                  <button onClick={() => setMfaEnabled(!mfaEnabled)} className={`w-10 h-5 rounded-full transition-colors ${mfaEnabled ? "bg-green-500" : "bg-gray-300"}`}>
                    <div className={`size-4 bg-white rounded-full mx-0.5 transition-transform ${mfaEnabled ? "translate-x-5" : ""}`} />
                  </button>
                </div>
              </div>
              <div className="border border-[#D1D5DB] p-3">
                <p className="text-[10px] text-[#9CA3AF]">LDAP URL</p>
                <input value={ldapUrl} onChange={e => setLdapUrl(e.target.value)} className="w-full mt-1 px-2 py-1.5 text-sm font-mono border border-[#D1D5DB] focus:border-[#A31D1D] focus:ring-1 focus:ring-[#A31D1D]" />
              </div>
              <p className="text-[10px] text-[#9CA3AF]">* การเปลี่ยนแปลงการตั้งค่าการยืนยันตัวตนต้องรีสตาร์ทระบบจึงจะมีผล</p>
            </div>
          )}

          {/* BRANDING SECTION */}
          {section === "branding" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-[#1A1A2E]">UI & แบรนด์</h3>
                <div className="flex gap-2">
                  <button onClick={() => handleReset("branding")} className="flex items-center gap-1 px-3 py-1.5 text-xs border border-[#D1D5DB] text-[#6B7280] hover:bg-gray-100"><RotateCcw className="size-3" /> คืนค่าเริ่มต้น</button>
                  <button onClick={() => handleSave("branding")} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800] disabled:opacity-50"><Save className="size-3" /> {saving ? "กำลังบันทึก..." : "บันทึก"}</button>
                </div>
              </div>
              <SettingsField label="ชื่อระบบ" value={systemName} onChange={setSystemName} />
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-[#D1D5DB] p-3">
                  <p className="text-[10px] text-[#9CA3AF]">สีธีมหลัก</p>
                  <div className="flex items-center gap-2 mt-1"><input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-8 h-8 border-0 cursor-pointer" /><input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="flex-1 px-2 py-1 text-sm font-mono border border-[#D1D5DB]" /></div>
                </div>
                <div className="border border-[#D1D5DB] p-3">
                  <p className="text-[10px] text-[#9CA3AF]">สีธีมรอง</p>
                  <div className="flex items-center gap-2 mt-1"><input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="w-8 h-8 border-0 cursor-pointer" /><input value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="flex-1 px-2 py-1 text-sm font-mono border border-[#D1D5DB]" /></div>
                </div>
              </div>
              <div className="border border-[#D1D5DB] p-3">
                <p className="text-[10px] text-[#9CA3AF]">Logo URL</p>
                <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" className="w-full mt-1 px-2 py-1.5 text-sm border border-[#D1D5DB] focus:border-[#A31D1D] focus:ring-1 focus:ring-[#A31D1D]" />
              </div>
              {/* Live Preview */}
              <div className="border border-[#FDB813] p-4">
                <p className="text-[10px] text-[#9CA3AF] mb-2">ตัวอย่าง (Live Preview)</p>
                <div className="flex gap-2">
                  <div className="size-10" style={{backgroundColor: primaryColor}} />
                  <div className="size-10" style={{backgroundColor: secondaryColor}} />
                </div>
                <p className="text-sm font-bold mt-2" style={{color: secondaryColor}}>{systemName || "System Name"}</p>
              </div>
            </div>
          )}

          {/* STORAGE SECTION */}
          {section === "storage" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-[#1A1A2E]">การตั้งค่าพื้นที่จัดเก็บ</h3>
                <div className="flex gap-2">
                  <button onClick={() => handleReset("storage")} className="flex items-center gap-1 px-3 py-1.5 text-xs border border-[#D1D5DB] text-[#6B7280] hover:bg-gray-100"><RotateCcw className="size-3" /> คืนค่าเริ่มต้น</button>
                  <button onClick={() => handleSave("storage")} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800] disabled:opacity-50"><Save className="size-3" /> {saving ? "กำลังบันทึก..." : "บันทึก"}</button>
                </div>
              </div>
              <SettingsField label="ขนาดสูงสุดต่อผู้ใช้ (GB)" value={maxStorageGb} onChange={setMaxStorageGb} hint="พื้นที่เก็บข้อมูล Personal Pool" />
              <div className="border border-[#D1D5DB] p-3">
                <p className="text-[10px] text-[#9CA3AF]">ประเภทไฟล์ที่อนุญาต</p>
                <input value={allowedFileTypes} onChange={e => setAllowedFileTypes(e.target.value)} className="w-full mt-1 px-2 py-1.5 text-sm border border-[#D1D5DB] focus:border-[#A31D1D] focus:ring-1 focus:ring-[#A31D1D]" />
                <p className="text-[10px] text-[#9CA3AF] mt-1">คั่นด้วยเครื่องหมายจุลภาค</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-[#D1D5DB] p-3"><p className="text-[10px] text-[#9CA3AF]">พื้นที่ทั้งหมด</p><p className="text-sm font-medium text-[#1A1A2E] mt-0.5">500 GB</p></div>
                <div className="border border-[#D1D5DB] p-3"><p className="text-[10px] text-[#9CA3AF]">พื้นที่ที่ใช้แล้ว</p><p className="text-sm font-medium text-[#1A1A2E] mt-0.5">186 GB (37%)</p></div>
              </div>
              <div className="w-full h-3 bg-[#F5F5F5]"><div className="h-3 bg-[#FDB813]" style={{width: "37%"}} /></div>
            </div>
          )}

          {/* API SECTION */}
          {section === "api" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#1A1A2E]">API Key Management</h3>
              <div className="bg-[#FAFAFA] border border-[#D1D5DB] p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-[#6B7280]">จัดการ API Key สำหรับระบบภายนอก</p>
                  <button className="px-3 py-1.5 text-xs font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800]">+ สร้าง API Key</button>
                </div>
                <table className="w-full text-xs">
                  <thead><tr className="text-left border-b border-[#E5E7EB]"><th className="py-2 font-medium text-[#6B7280]">ชื่อ</th><th className="py-2 font-medium text-[#6B7280] hidden md:table-cell">Key</th><th className="py-2 font-medium text-[#6B7280] hidden lg:table-cell">สร้างเมื่อ</th><th className="py-2 font-medium text-[#6B7280]">สถานะ</th></tr></thead>
                  <tbody>
                    {[{ name: "ระบบ ERP", key: "top_sk_a1b2c3...f8g9", date: "2026-06-01", active: true }, { name: "ระบบห้องสมุด", key: "top_sk_x7y8z9...w2v3", date: "2026-05-15", active: true }].map(k => (
                      <tr key={k.name} className="border-b border-[#F5F5F5]">
                        <td className="py-2 font-medium text-[#1A1A2E]">{k.name}</td>
                        <td className="py-2 text-[#9CA3AF] font-mono hidden md:table-cell">{k.key}</td>
                        <td className="py-2 text-[#6B7280] hidden lg:table-cell">{new Date(k.date).toLocaleDateString("th-TH")}</td>
                        <td className="py-2"><span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700">ใช้งาน</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsField({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <div className="border border-[#D1D5DB] p-3">
      <p className="text-[10px] text-[#9CA3AF]">{label}</p>
      <input value={value} onChange={e => onChange(e.target.value)} className="w-full mt-1 px-2 py-1.5 text-sm border border-[#D1D5DB] focus:border-[#A31D1D] focus:ring-1 focus:ring-[#A31D1D]" />
      {hint && <p className="text-[10px] text-[#9CA3AF] mt-0.5">{hint}</p>}
    </div>
  );
}
