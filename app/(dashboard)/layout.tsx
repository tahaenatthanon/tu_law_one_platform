"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppHubProvider } from "@/lib/app-hub-context";
import Sidebar from "@/components/layouts/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Show nothing while checking session (prevents flash of protected content)
  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F5F5F5]">
        <div className="animate-spin h-8 w-8 border-4 border-[#8B1515] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <AppHubProvider>
      <div className="flex h-screen overflow-hidden bg-[#F5F5F5]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </AppHubProvider>
  );
}
