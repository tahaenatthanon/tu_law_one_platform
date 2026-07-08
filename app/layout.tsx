import type { Metadata } from "next";
import { Prompt, Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import AuthProvider from "@/components/auth/auth-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-prompt",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TULAW ONE PLATFORM | คณะนิติศาสตร์ มหาวิทยาลัยธรรมศาสตร์",
  description:
    "ระบบศูนย์กลางดิจิทัลสำหรับคณะนิติศาสตร์ มหาวิทยาลัยธรรมศาสตร์",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={cn("h-full", "antialiased", prompt.variable, "font-sans", geist.variable)}>
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <TooltipProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
