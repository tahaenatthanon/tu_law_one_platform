"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstNameTh: "",
    lastNameTh: "",
  });
  const [acceptPolicy, setAcceptPolicy] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!acceptPolicy) {
      setError("กรุณายอมรับเงื่อนไขการใช้งานและนโยบาย PDPA");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message || "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
        setIsLoading(false);
        return;
      }
      router.push("/login?registered=true");
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองอีกครั้ง");
      setIsLoading(false);
    }
  }

  return (
    <div className="h-screen overflow-hidden flex">
      {/* ═══════ LEFT PANEL — Branding ═══════ */}
      <div className="hidden lg:flex lg:w-3/5 bg-[#8B1515] flex-col justify-between">

        {/* ─── Top: Branding ─── */}
        <div className="flex flex-col items-start px-12 xl:px-16 pt-16">
          {/* TU Seal — large & bold */}
          <div className="w-20 h-20 mb-8 bg-[#FDB813] flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold text-white tracking-tighter leading-none">
            TULAW
          </h1>
          <h2 className="text-4xl xl:text-5xl font-extrabold text-[#FDB813] tracking-tighter leading-none">
            ONE PLATFORM
          </h2>

          <p className="text-base text-white font-medium max-w-md leading-relaxed">
            มหาวิทยาลัยธรรมศาสตร์
          </p>
          <p className="text-base text-[#FDB813] font-semibold">
            คณะนิติศาสตร์
          </p>

          <p className="text-base text-[#FDB813] font-bold max-w-md leading-snug mt-10">
            One Platform สำหรับทุกบริการของคณะนิติศาสตร์
          </p>
          <p className="text-base text-white font-semibold max-w-md leading-snug mt-2">
            รวมทุกระบบ ทุกบริการ และทุกการใช้งานไว้ในแพลตฟอร์มเดียว
          </p>
        </div>

        {/* ─── Bottom: Footer ─── */}
        <div className="px-12 xl:px-16 pb-10">
          <div className="flex items-center gap-2 text-xs text-[#D1D5DB]">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            TLS 1.3 &middot; MFA สำหรับผู้ดูแลระบบ &middot; &copy; {new Date().getFullYear()} TULAW
          </div>
        </div>
      </div>

      {/* ═══════ RIGHT PANEL — Form ═══════ */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 sm:px-10">
        <div className="w-full max-w-sm xl:max-w-md">
          {/* ─── Mobile-only branding ─── */}
          <div className="lg:hidden text-center mb-6">
            <div className="w-14 h-14 mx-auto mb-3 bg-[#FDB813] flex items-center justify-center">
              <svg className="w-7 h-7 text-[#A31D1D]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-[#1A1A2E]">TULAW ONE PLATFORM</h2>
          </div>

          <p className="text-sm text-[#A31D1D] font-semibold tracking-widest uppercase mb-3">
            Register
          </p>

          <h2 className="text-2xl font-bold text-[#1A1A2E] mb-1">ลงทะเบียน</h2>
          <p className="text-sm text-[#6B7280] mb-5">ลงทะเบียนบัญชีใหม่สำหรับบุคลากรคณะนิติศาสตร์</p>

          {/* ─── Card ─── */}
          <div className="bg-white border border-[#E5E7EB] p-5 xl:p-6">
            {error && (
              <div className="mb-4 p-2.5 bg-[#FCE4E8] border border-[#A31D1D] text-[#A31D1D] text-sm flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A2E] mb-1">
                    ชื่อ <span className="text-[#A31D1D]">*</span>
                  </label>
                  <input
                    name="firstNameTh"
                    type="text"
                    value={form.firstNameTh}
                    onChange={handleChange}
                    placeholder="สมชาย"
                    required
                    className="w-full px-3 py-2 text-sm border border-[#D1D5DB] bg-white
                               placeholder:text-[#9CA3AF]
                               focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1A2E] mb-1">
                    นามสกุล <span className="text-[#A31D1D]">*</span>
                  </label>
                  <input
                    name="lastNameTh"
                    type="text"
                    value={form.lastNameTh}
                    onChange={handleChange}
                    placeholder="รักเรียน"
                    required
                    className="w-full px-3 py-2 text-sm border border-[#D1D5DB] bg-white
                               placeholder:text-[#9CA3AF]
                               focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1">
                  Username / Email <span className="text-[#A31D1D]">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="firstname.l@tulaw.ac.th"
                  required
                  className="w-full px-3 py-2 text-sm border border-[#D1D5DB] bg-white
                             placeholder:text-[#9CA3AF]
                             focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1">
                  Password <span className="text-[#A31D1D]">*</span>
                </label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                  required
                  minLength={8}
                  className="w-full px-3 py-2 text-sm border border-[#D1D5DB] bg-white
                             placeholder:text-[#9CA3AF]
                             focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1">
                  ยืนยันรหัสผ่าน <span className="text-[#A31D1D]">*</span>
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                  required
                  className="w-full px-3 py-2 text-sm border border-[#D1D5DB] bg-white
                             placeholder:text-[#9CA3AF]
                             focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30"
                />
              </div>

              {/* PDPA */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptPolicy}
                  onChange={(e) => setAcceptPolicy(e.target.checked)}
                  className="mt-0.5 w-4 h-4 border-[#D1D5DB] text-[#FDB813] focus:ring-[#FDB813]/30 accent-[#FDB813]"
                />
                <span className="text-xs text-[#6B7280] leading-relaxed">
                  ฉันยอมรับ{" "}
                  <a href="#" className="text-[#A31D1D] hover:underline font-medium">เงื่อนไขการใช้งาน</a>
                  {" "}และ{" "}
                  <a href="#" className="text-[#A31D1D] hover:underline font-medium">นโยบาย PDPA</a>
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 text-sm font-semibold text-[#1A1A2E]
                           bg-[#FDB813] hover:bg-[#E5A800]
                           focus:outline-none focus:ring-2 focus:ring-[#FDB813]/50 focus:ring-offset-2
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-colors duration-150
                           flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    กำลังลงทะเบียน...
                  </>
                ) : (
                  <>
                    ลงทะเบียน
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-[#6B7280]">
              มีบัญชีอยู่แล้ว?{" "}
              <Link href="/login" className="font-semibold text-[#A31D1D] hover:text-[#8B1515]">
                เข้าสู่ระบบ
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
