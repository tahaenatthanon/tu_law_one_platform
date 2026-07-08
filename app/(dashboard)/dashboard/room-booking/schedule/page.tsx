"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import RequireRole from "@/components/shared/require-role";
import { Calendar } from "lucide-react";

type Booking = { id: string; room: { name: string }; title: string; startTime: string; endTime: string; status: string; user?: { firstNameTh: string; lastNameTh: string } };

export default function BookingSchedulePage() {
  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as any)?.roles ?? [];

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    fetch(`/api/room-booking?date=${selectedDate}`)
      .then(r => r.json())
      .then(json => { if (json.success) setBookings(json.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedDate]);

  const today = new Date(selectedDate);
  const monthDays = Array.from({ length: 31 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), i + 1);
    return d.toISOString().split("T")[0];
  }).filter(d => new Date(d).getMonth() === today.getMonth());

  const bookingsForDay = (date: string) => bookings.filter(b => b.startTime.startsWith(date));

  return (
    <RequireRole roles={["super_admin","system_admin","dean","dept_admin","user","viewer"]}>
    <div className="pt-0 px-6 pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">ปฏิทินการจอง</h1>
          <p className="text-sm text-[#6B7280]">ดูตารางการใช้ห้องประชุมทั้งหมด</p>
        </div>
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
          className="px-3 py-2 text-sm border border-[#D1D5DB]" />
      </div>

      {loading ? <p className="text-[#9CA3AF] text-sm">กำลังโหลด...</p> : (
        <div className="space-y-4">
          {monthDays.slice(0, 14).map(date => {
            const dayBookings = bookingsForDay(date);
            return (
              <div key={date} className="bg-white border border-[#D1D5DB] p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="size-4 text-[#A31D1D]" />
                  <p className="text-sm font-bold text-[#1A1A2E]">
                    {new Date(date).toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                  <span className="text-[10px] text-[#9CA3AF]">{dayBookings.length} รายการ</span>
                </div>
                {dayBookings.length === 0 ? (
                  <p className="text-xs text-[#9CA3AF] pl-6">ไม่มีรายการจอง</p>
                ) : (
                  <div className="space-y-1 pl-6">
                    {dayBookings.map(b => (
                      <div key={b.id} className="flex items-center justify-between text-xs py-1 border-b border-[#F5F5F5] last:border-0">
                        <div>
                          <span className="font-medium text-[#1A1A2E]">{b.title}</span>
                          <span className="text-[#9CA3AF] ml-2">{new Date(b.startTime).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} - {new Date(b.endTime).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[#6B7280]">{b.room?.name}</span>
                          <span className="text-[10px] px-1 py-0.5 bg-green-100 text-green-700">{b.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
    </RequireRole>
  );
}
