"use client";

import { Suspense, useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Layers, AlertCircle, EyeOff, Eye, ArrowRight, Loader2 } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isMsLoading, setIsMsLoading] = useState(false);

  // จับ error จาก NextAuth callback (เช่น Google OAuth error, credentials error)
  useEffect(() => {
    const authError = searchParams.get("error");
    if (authError) {
      if (authError === "OAuthSignin" || authError === "OAuthCallback") {
        setError("การเข้าสู่ระบบด้วย Google ไม่สำเร็จ กรุณาลองอีกครั้ง");
      } else if (authError === "CredentialsSignin") {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง");
      } else if (authError === "AccessDenied") {
        setError("บัญชีของคุณไม่มีสิทธิ์เข้าถึงระบบ กรุณาติดต่อผู้ดูแล");
      } else {
        setError("เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
      }
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard/application-hub";

    // ใช้ redirect ของ NextAuth โดยตรง — จัดการ cookie + redirect ในครั้งเดียว
    await signIn("credentials", {
      email,
      password,
      callbackUrl,
    });
  }

  async function handleGoogleSignIn() {
    setError("");
    setIsMsLoading(true);
    await signIn("google", { 
      callbackUrl: "/dashboard/application-hub",
      prompt: "select_account",
    });
  }

  return (
    <div className="h-screen overflow-hidden flex">
      {/* ═══════ LEFT PANEL — Branding ═══════ */}
      <div className="hidden lg:flex lg:w-3/5 bg-[#8B1515] flex-col justify-between">

        {/* ─── Top: Branding ─── */}
        <div className="flex flex-col items-start px-12 xl:px-16 pt-16">
          {/* TU Seal — large & bold */}
          <div className="w-20 h-20 mb-8 bg-[#FDB813] flex items-center justify-center">
            <Layers className="w-10 h-10 text-white" fill="currentColor" strokeWidth={0} />
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold text-white tracking-tighter leading-none">
            TU LAW
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
      </div>

      {/* ═══════ RIGHT PANEL — Form ═══════ */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 sm:px-10">
        <div className="w-full max-w-sm xl:max-w-md">
          {/* ─── Mobile-only branding ─── */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#FDB813] flex items-center justify-center">
              <Layers className="w-8 h-8 text-[#A31D1D]" fill="currentColor" strokeWidth={0} />
            </div>
            <h2 className="text-xl font-bold text-[#1A1A2E]">TULAW ONE PLATFORM</h2>
          </div>

          <p className="text-sm text-[#A31D1D] font-semibold tracking-widest uppercase mb-4">
            Sign in
          </p>

          <h2 className="text-2xl font-bold text-[#1A1A2E] mb-1">เข้าสู่ระบบ</h2>
          <p className="text-sm text-[#6B7280] mb-6">ใช้บัญชี Active Directory ของคณะ (TU LAW)</p>

          {/* ─── Form ─── */}
          <div className="bg-transparent">
            {error && (
              <div className="mb-5 p-3 bg-[#FCE4E8] border border-[#A31D1D] text-[#A31D1D] text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={2} />
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
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-2.5 pr-10 text-sm border border-[#D1D5DB] bg-white
                               placeholder:text-[#9CA3AF]
                               focus:outline-none focus:border-[#FDB813] focus:ring-2 focus:ring-[#FDB813]/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1A1A2E]"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" strokeWidth={2} />
                    ) : (
                      <Eye className="w-4 h-4" strokeWidth={2} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-sm font-semibold text-[#1A1A2E]
                           bg-[#FDB813] hover:bg-[#E5A800]
                           focus:outline-none focus:ring-2 focus:ring-[#FDB813]/50 focus:ring-offset-2
                           transition-colors duration-150
                           flex items-center justify-center gap-2"
              >
                  เข้าสู่ระบบ
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
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
              onClick={handleGoogleSignIn}
              disabled={isMsLoading}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white
                         bg-[#A31D1D] hover:bg-[#8B1515]
                         focus:outline-none focus:ring-2 focus:ring-[#A31D1D]/50 focus:ring-offset-2
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors duration-150
                         flex items-center justify-center gap-2"
            >
              {isMsLoading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" strokeWidth={2} />
                  กำลังเชื่อมต่อ Google...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  SSO ด้วย Google
                </>
              )}
            </button>

            <p className="mt-5 text-center text-xs text-[#6B7280]">
              &nbsp;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#FDB813] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#6B7280]">กำลังโหลด...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
