"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import RequireRole from "@/components/shared/require-role";

type Room = { id: string; name: string; capacity: number };
type Booking = { id: string; room: Room; title: string; startTime: string; endTime: string; attendeeCount?: number; msTeamsLink?: string; status: string; user?: { firstNameTh: string; lastNameTh: string } };

export default function RoomBookingPage() {
  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as any)?.roles ?? [];
  const canBook = userRoles.some((r: string) => ["super_admin","system_admin","dean","dept_admin","user"].includes(r));
  const [tab, setTab] = useState<"rooms" | "my-bookings">("rooms");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [message, setMessage] = useState("");

  const [roomId, setRoomId] = useState("");
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [attendeeCount, setAttendeeCount] = useState("");
  const [msTeamsLink, setMsTeamsLink] = useState("");
  const [remark, setRemark] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "rooms") {
        const [rRes, bRes] = await Promise.all([
          fetch("/api/room-booking?type=rooms"),
          fetch(`/api/room-booking?date=${selectedDate}`),
        ]);
        const rJson = await rRes.json(); const bJson = await bRes.json();
        if (rJson.success) setRooms(rJson.data);
        if (bJson.success) setBookings(bJson.data);
      } else {
        const res = await fetch("/api/room-booking?type=my-bookings");
        const json = await res.json();
        if (json.success) setMyBookings(json.data);
      }
    } catch {}
    setLoading(false);
  }, [tab, selectedDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleBook = async () => {
    if (!roomId || !title || !startTime || !endTime) { setMessage("กรุณากรอกข้อมูลให้ครบถ้วน"); return; }
    setSubmitLoading(true); setMessage("");
    try {
      const res = await fetch("/api/room-booking", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, title, startTime, endTime, attendeeCount: parseInt(attendeeCount) || undefined, msTeamsLink, remark }),
      });
      const json = await res.json();
      if (json.success) { setMessage("จองห้องประชุมสำเร็จ"); setShowForm(false); fetchData(); }
      else setMessage(json.error?.message ?? "เกิดข้อผิดพลาด");
    } catch { setMessage("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์"); }
    setSubmitLoading(false);
  };

  const timeFmt = (d: string) => new Date(d).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  const dateFmt = (d: string) => new Date(d).toLocaleDateString("th-TH");

  const renderContent = () => {
    if (loading) return <p className="text-[#9CA3AF]">กำลังโหลด...</p>;
    if (tab === "rooms") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map(r => {
            const roomBookings = bookings.filter(b => b.room.id === r.id);
            return (
              <div key={r.id} className="bg-white border border-[#D1D5DB] p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-[#1A1A2E]">{r.name}</h3>
                  <span className="text-xs text-[#9CA3AF]">ความจุ {r.capacity} คน</span>
                </div>
                {roomBookings.length === 0 ? (
                  <p className="text-sm text-green-600">✅ ว่างทั้งวัน</p>
                ) : (
                  <div className="space-y-1">
                    {roomBookings.map(b => (
                      <div key={b.id} className="text-xs p-1.5 bg-[#FDB813]/10 border-l-2 border-[#FDB813]">
                        <span className="font-medium">{timeFmt(b.startTime)} — {timeFmt(b.endTime)}</span>
                        <span className="ml-1 text-[#6B7280]">{b.title}</span>
                        <span className="ml-1 text-[#9CA3AF]">({b.user?.firstNameTh})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }
    if (myBookings.length === 0) return <div className="text-center py-16 text-[#9CA3AF]"><p className="text-sm">ไม่มีรายการจอง</p></div>;
    return (
      <div className="space-y-2">
        {myBookings.map(b => (
          <div key={b.id} className="bg-white border border-[#D1D5DB] p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-[#1A1A2E]">{b.title}</h3>
                <p className="text-sm text-[#6B7280]">{b.room?.name} | {dateFmt(b.startTime)} {timeFmt(b.startTime)} — {timeFmt(b.endTime)}</p>
                {b.attendeeCount && <p className="text-xs text-[#9CA3AF]">{b.attendeeCount} คน</p>}
              </div>
              <span className={`text-xs px-2 py-0.5 font-medium ${b.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                {b.status === "confirmed" ? "ยืนยันแล้ว" : b.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="pt-0 px-6 pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">ระบบจองห้องประชุม</h1>
          <p className="text-sm text-[#6B7280]">ดูห้องว่าง จองห้องประชุม และรายการจองของฉัน</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2.5 text-sm font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800]">+ จองห้องประชุม</button>
      </div>

      <div className="flex gap-2 mb-4">
        {(["rooms", "my-bookings"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${tab === t ? "bg-[#8B1515] text-white" : "bg-white text-[#6B7280] border border-[#D1D5DB] hover:border-[#FDB813]"}`}>
            {t === "rooms" ? "🏢 ดูห้องว่าง" : "📋 รายการจองของฉัน"}
          </button>
        ))}
      </div>

      {message && <div className={`p-3 mb-4 text-sm ${message.includes("สำเร็จ") ? "bg-green-50 border border-green-300 text-green-700" : "bg-[#FCE4E8] border border-[#A31D1D] text-[#A31D1D]"}`}>{message}</div>}

      {tab === "rooms" && (
        <div className="mb-4"><input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="px-3 py-2 text-sm border border-[#D1D5DB]" /></div>
      )}

      {renderContent()}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowForm(false)}>
          <div className="bg-white border border-[#FDB813] p-6 w-full max-w-md mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">จองห้องประชุม</h3>
            <div className="mb-3"><label className="block text-xs font-medium text-[#1A1A2E] mb-1">ห้องประชุม</label><select value={roomId} onChange={e => setRoomId(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB]"><option value="">เลือกห้อง</option>{rooms.map(r => <option key={r.id} value={r.id}>{r.name} (ความจุ {r.capacity})</option>)}</select></div>
            <div className="mb-3"><label className="block text-xs font-medium text-[#1A1A2E] mb-1">หัวข้อการประชุม</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813]" /></div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">เวลาเริ่ม</label><input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB]" /></div>
              <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">เวลาสิ้นสุด</label><input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB]" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">จำนวนผู้เข้าร่วม</label><input type="number" value={attendeeCount} onChange={e => setAttendeeCount(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB]" /></div>
              <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">MS Teams Link</label><input type="text" value={msTeamsLink} onChange={e => setMsTeamsLink(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB]" /></div>
            </div>
            <div className="mb-4"><label className="block text-xs font-medium text-[#1A1A2E] mb-1">หมายเหตุ</label><textarea value={remark} onChange={e => setRemark(e.target.value)} rows={2} className="w-full px-3 py-2 text-sm border border-[#D1D5DB]" /></div>
            <div className="flex gap-2"><button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 text-sm font-medium border border-[#D1D5DB] text-[#6B7280] hover:bg-gray-100">ยกเลิก</button>
              <button onClick={handleBook} disabled={submitLoading}
                className="flex-1 px-4 py-2.5 text-sm font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800] disabled:opacity-50">{submitLoading ? "กำลังจอง..." : "จองห้อง"}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
