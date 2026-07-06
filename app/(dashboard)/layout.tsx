"use client";

import { AppHubProvider } from "@/lib/app-hub-context";
import Sidebar from "@/components/layouts/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppHubProvider>
      <div className="flex h-screen overflow-hidden bg-[#F5F5F5]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </AppHubProvider>
  );
}
