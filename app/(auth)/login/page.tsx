"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptPolicy, setAcceptPolicy] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!acceptPolicy) {
      setError("กรุณายอมรับเงื่อนไขการใช้งานและนโยบาย PDPA");
      return;
    }
    setError("");
    setIsLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง");
    } else if (result?.ok) {
      router.push("/dashboard");
      router.refresh();
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
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#FDB813] flex items-center justify-center">
              <svg className="w-8 h-8 text-[#A31D1D]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#1A1A2E]">TULAW ONE PLATFORM</h2>
          </div>

          <p className="text-sm text-[#A31D1D] font-semibold tracking-widest uppercase mb-4">
            Sign in
          </p>

          <h2 className="text-2xl font-bold text-[#1A1A2E] mb-1">เข้าสู่ระบบ</h2>
          <p className="text-sm text-[#6B7280] mb-6">ใช้บัญชี Active Directory ของคณะ (TULAW)</p>

          {/* ─── Card ─── */}
          <div className="bg-white border border-[#E5E7EB] p-6 xl:p-8">
            {error && (
              <div className="mb-5 p-3 bg-[#FCE4E8] border border-[#A31D1D] text-[#A31D1D] text-sm flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                  Username / Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="firstname.l@tulaw.ac.th"
                  required
                  className="w-full px-4 py-2.5 text-sm border border-[#D1D5DB] bg-white
                             placeholder:text-[#9CA3AF]
                             focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-[#1A1A2E]">
                    Password
                  </label>
                  <a href="#" className="text-xs font-medium text-[#A31D1D] hover:text-[#8B1515]">
                    ลืมรหัสผ่าน?
                  </a>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 text-sm border border-[#D1D5DB] bg-white
                             placeholder:text-[#9CA3AF]
                             focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30"
                />
              </div>

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
                    กำลังเข้าสู่ระบบ...
                  </>
                ) : (
                  <>
                    เข้าสู่ระบบ
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5E7EB]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-[#9CA3AF]">หรือ</span>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-2.5 px-4 text-sm font-semibold text-white
                         bg-[#A31D1D] hover:bg-[#8B1515]
                         focus:outline-none focus:ring-2 focus:ring-[#A31D1D]/50 focus:ring-offset-2
                         transition-colors duration-150
                         flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 21 21" fill="none">
                <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
              </svg>
              SSO ด้วย Microsoft 365
            </button>

            <p className="mt-5 text-center text-xs text-[#6B7280]">
              ยังไม่มีบัญชี?{" "}
              <Link href="/register" className="font-semibold text-[#A31D1D] hover:text-[#8B1515]">
                ลงทะเบียน
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
