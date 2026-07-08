"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BookMeetingRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/dashboard/room-booking"); }, [router]);
  return <div className="flex items-center justify-center h-screen text-sm text-[var(--tu-text-secondary)]">กำลังเปลี่ยนเส้นทางไปหน้าระบบจองห้องประชุม...</div>;
}
