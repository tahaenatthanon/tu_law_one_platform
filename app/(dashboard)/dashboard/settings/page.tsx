"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import RequireRole from "@/components/shared/require-role";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Clock, Globe, Sun, Moon, Monitor, Save, User, Shield } from "lucide-react";

/* ─── Theme Picker ─── */
const THEME_OPTIONS = [
  { key: "light", icon: Sun, label: "สว่าง" },
  { key: "dark", icon: Moon, label: "มืด" },
  { key: "system", icon: Monitor, label: "ตามระบบ" },
] as const;

function ThemePicker({ theme, setTheme }: { theme: string; setTheme: (v: string) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {THEME_OPTIONS.map((t) => (
        <button
          key={t.key}
          onClick={() => setTheme(t.key)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md border transition-colors duration-200
            ${theme === t.key
              ? "bg-[var(--tu-secondary-dark)] text-white border-[var(--tu-secondary-dark)]"
              : "bg-white text-[var(--tu-text-secondary)] border-[var(--tu-border)] hover:bg-[var(--tu-surface)]"
            }`}
        >
          <t.icon className="size-4" />
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ─── Language Picker ─── */
const LANG_OPTIONS = [
  { key: "th", label: "ภาษาไทย" },
  { key: "en", label: "English" },
] as const;

function LangPicker({ lang, setLang }: { lang: string; setLang: (v: string) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {LANG_OPTIONS.map((l) => (
        <button
          key={l.key}
          onClick={() => setLang(l.key)}
          className={`px-4 py-2.5 text-sm font-medium rounded-md border transition-colors duration-200
            ${lang === l.key
              ? "bg-[var(--tu-secondary-dark)] text-white border-[var(--tu-secondary-dark)]"
              : "bg-white text-[var(--tu-text-secondary)] border-[var(--tu-border)] hover:bg-[var(--tu-surface)]"
            }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

/* ─── Settings Row ─── */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[var(--tu-border)] last:border-b-0">
      <span className="text-sm text-[var(--tu-text-secondary)]">{label}</span>
      <span className="text-sm font-medium text-[var(--tu-text-primary)]">{value}</span>
    </div>
  );
}

/* ─── Main Page ─── */
const AUTO_LOGOUT_OPTIONS = [
  { value: "15", label: "15 นาที" },
  { value: "30", label: "30 นาที" },
  { value: "60", label: "1 ชั่วโมง" },
  { value: "120", label: "2 ชั่วโมง" },
  { value: "never", label: "ไม่ต้องออก" },
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as Record<string, unknown>)?.roles as string[] ?? [];
  const isAdmin = userRoles.some((r) => ["super_admin", "system_admin"].includes(r));

  const [theme, setTheme] = useState("light");
  const [lang, setLang] = useState("th");
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifBrowser, setNotifBrowser] = useState(true);
  const [autoLogout, setAutoLogout] = useState("30");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const userName = (session?.user as Record<string, unknown>)?.name as string ?? "ผู้ใช้งาน";
  const userEmail = (session?.user as Record<string, unknown>)?.email as string ?? "-";
  const initials = userName.charAt(0).toUpperCase();

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setMessage({ type: "success", text: "บันทึกการตั้งค่าส่วนตัวสำเร็จ" });
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }, 500);
  };

  const roleLabel = (role: string): string => {
    const map: Record<string, string> = {
      super_admin: "Super Admin",
      system_admin: "System Admin",
      dean: "คณบดี",
      dept_admin: "ผู้ดูแลแผนก",
      user: "ผู้ใช้",
      viewer: "ผู้ดู",
    };
    return map[role] ?? role;
  };

  return (
    <RequireRole roles={["super_admin", "system_admin", "dean", "dept_admin", "user", "viewer"]}>
      <div className="px-6 pb-8">
        {/* ─── Header ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--tu-text-primary)] mb-1">ตั้งค่า</h1>
            <p className="text-sm text-[var(--tu-text-secondary)]">
              ปรับแต่งการตั้งค่าส่วนตัว — ธีม ภาษา การแจ้งเตือน และเซสชัน
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[var(--tu-primary)] text-[var(--tu-text-primary)] hover:bg-[var(--tu-primary-dark)] disabled:opacity-50 transition-colors duration-200 self-start sm:self-auto"
          >
            <Save className="size-4" />
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </div>

        {/* ─── Feedback ─── */}
        {message && (
          <div
            className={`p-3 mb-6 text-sm rounded-md border ${
              message.type === "success"
                ? "bg-[var(--tu-success-light)] border-[var(--tu-success)] text-[var(--tu-success)]"
                : "bg-[var(--tu-error-light)] border-[var(--tu-error)] text-[var(--tu-error)]"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* ─── Content Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ─── ธีมและการแสดงผล ─── */}
          <Card className="border-[var(--tu-border-dark)] rounded-lg shadow-none">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-sm font-bold text-[var(--tu-text-primary)]">
                <Sun className="size-4 text-[var(--tu-secondary)]" />
                ธีมและการแสดงผล
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="text-xs text-[var(--tu-text-secondary)] mb-2">โหมดธีม</p>
                <ThemePicker theme={theme} setTheme={setTheme} />
              </div>
              <div>
                <p className="text-xs text-[var(--tu-text-secondary)] mb-2">ภาษา</p>
                <LangPicker lang={lang} setLang={setLang} />
              </div>
            </CardContent>
          </Card>

          {/* ─── การแจ้งเตือน ─── */}
          <Card className="border-[var(--tu-border-dark)] rounded-lg shadow-none">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-sm font-bold text-[var(--tu-text-primary)]">
                <Bell className="size-4 text-[var(--tu-secondary)]" />
                การแจ้งเตือน
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--tu-text-primary)]">แจ้งเตือนทางอีเมล</p>
                  <p className="text-xs text-[var(--tu-text-muted)]">รับอีเมลเมื่อมีประกาศใหม่หรือคำขออนุมัติ</p>
                </div>
                <Switch checked={notifEmail} onCheckedChange={setNotifEmail} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--tu-text-primary)]">แจ้งเตือนทางเบราว์เซอร์</p>
                  <p className="text-xs text-[var(--tu-text-muted)]">แสดงป๊อปอัปเมื่อมีข้อความใหม่</p>
                </div>
                <Switch checked={notifBrowser} onCheckedChange={setNotifBrowser} />
              </div>
            </CardContent>
          </Card>

          {/* ─── เซสชัน ─── */}
          <Card className="border-[var(--tu-border-dark)] rounded-lg shadow-none">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-sm font-bold text-[var(--tu-text-primary)]">
                <Clock className="size-4 text-[var(--tu-secondary)]" />
                เซสชัน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <label className="text-xs text-[var(--tu-text-secondary)] block mb-2">
                ออกจากระบบอัตโนมัติเมื่อไม่มีการใช้งาน
              </label>
              <Select value={autoLogout} onValueChange={setAutoLogout}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="เลือกระยะเวลา" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {AUTO_LOGOUT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* ─── ข้อมูลบัญชี ─── */}
          <Card className="border-[var(--tu-border-dark)] rounded-lg shadow-none">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-sm font-bold text-[var(--tu-text-primary)]">
                <User className="size-4 text-[var(--tu-secondary)]" />
                ข้อมูลบัญชี
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-[var(--tu-border)]">
                <Avatar className="size-12 bg-[var(--tu-primary)]">
                  <AvatarFallback className="text-[var(--tu-secondary-dark)] font-bold text-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-[var(--tu-text-primary)]">{userName}</p>
                  <p className="text-xs text-[var(--tu-text-secondary)]">{userEmail}</p>
                </div>
              </div>
              <div className="space-y-1">
                <InfoRow label="อีเมล" value={userEmail} />
                <InfoRow label="ชื่อ" value={userName} />
                <InfoRow label="บทบาท" value={userRoles.map(roleLabel).join(", ") || "-"} />
              </div>
              {isAdmin && (
                <a
                  href="/dashboard/system-settings"
                  className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-[var(--tu-secondary)] hover:underline"
                >
                  <Shield className="size-4" />
                  ตั้งค่าระบบ (สำหรับผู้ดูแล)
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </RequireRole>
  );
}
