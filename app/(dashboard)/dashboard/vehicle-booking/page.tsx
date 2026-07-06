"use client";

import { useState, useEffect, useCallback } from "react";

type Vehicle = { id: string; licensePlate: string; model?: string };
type Booking = { id: string; vehicle: Vehicle; purpose: string; destination?: string; passengerCount?: number; startTime: string; endTime: string; status: string; approvedAt?: string };

export default function VehicleBookingPage() {
  const [tab, setTab] = useState<"vehicles" | "my-bookings">("vehicles");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  const [vehicleId, setVehicleId] = useState("");
  const [purpose, setPurpose] = useState("");
  const [destination, setDestination] = useState("");
  const [passengerCount, setPassengerCount] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "vehicles") {
        const [vRes, bRes] = await Promise.all([
          fetch("/api/vehicle-booking?type=vehicles"),
          fetch("/api/vehicle-booking"),
        ]);
        const vJson = await vRes.json(); const bJson = await bRes.json();
        if (vJson.success) setVehicles(vJson.data);
        if (bJson.success) setBookings(bJson.data);
      } else {
        const res = await fetch("/api/vehicle-booking?type=my-bookings");
        const json = await res.json();
        if (json.success) setMyBookings(json.data);
      }
    } catch {}
    setLoading(false);
  }, [tab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleBook = async () => {
    if (!vehicleId || !purpose || !startTime || !endTime) { setMessage("กรุณากรอกข้อมูลให้ครบถ้วน"); return; }
    setSubmitLoading(true); setMessage("");
    try {
      const res = await fetch("/api/vehicle-booking", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId, purpose, destination, passengerCount: parseInt(passengerCount) || undefined, startTime, endTime }),
      });
      const json = await res.json();
      if (json.success) { setMessage("จองรถสำเร็จ"); setShowForm(false); fetchData(); }
      else setMessage(json.error?.message ?? "เกิดข้อผิดพลาด");
    } catch { setMessage("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์"); }
    setSubmitLoading(false);
  };

  const timeFmt = (d: string) => new Date(d).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  const dateFmt = (d: string) => new Date(d).toLocaleDateString("th-TH");
  const statusLabel = (s: string) => ({ pending: "รออนุมัติ", approved: "อนุมัติแล้ว", rejected: "ไม่อนุมัติ", cancelled: "ยกเลิก", completed: "เสร็จสิ้น" }[s] ?? s);

  const renderContent = () => {
    if (loading) return <p className="text-[#9CA3AF]">กำลังโหลด...</p>;
    if (tab === "vehicles") {
      return (
        <div className="space-y-3">
          {vehicles.map(v => {
            const vehicleBookings = bookings.filter(b => b.vehicle.id === v.id && (b.status === "approved" || b.status === "pending"));
            return (
              <div key={v.id} className="bg-white border border-[#D1D5DB] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-[#1A1A2E]">{v.licensePlate}</h3>
                    {v.model && <p className="text-sm text-[#6B7280]">{v.model}</p>}
                  </div>
                  {vehicleBookings.length === 0 ? (
                    <span className="text-sm text-green-600">✅ ว่าง</span>
                  ) : (
                    <div className="text-xs text-right">
                      {vehicleBookings.map(b => (
                        <div key={b.id} className="text-[#A31D1D]">{dateFmt(b.startTime)} {timeFmt(b.startTime)} — {timeFmt(b.endTime)}</div>
                      ))}
                    </div>
                  )}
                </div>
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
                <h3 className="font-semibold text-[#1A1A2E]">{b.purpose}</h3>
                <p className="text-sm text-[#6B7280]">{b.vehicle?.licensePlate} | {dateFmt(b.startTime)} {timeFmt(b.startTime)} — {timeFmt(b.endTime)}</p>
                {b.destination && <p className="text-xs text-[#9CA3AF]">📍 {b.destination}</p>}
              </div>
              <span className={`text-xs px-2 py-0.5 font-medium ${b.status === "approved" ? "bg-green-100 text-green-700" : b.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-500"}`}>{statusLabel(b.status)}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">ระบบยืมรถ</h1>
          <p className="text-sm text-[#6B7280] mt-1">ดูรถว่างและจองรถคณะ</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2.5 text-sm font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800]">+ จองรถ</button>
      </div>

      <div className="flex gap-2 mb-4">
        {(["vehicles", "my-bookings"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${tab === t ? "bg-[#8B1515] text-white" : "bg-white text-[#6B7280] border border-[#D1D5DB] hover:border-[#FDB813]"}`}>
            {t === "vehicles" ? "🚗 ดูรถว่าง" : "📋 รายการจองของฉัน"}
          </button>
        ))}
      </div>

      {message && <div className={`p-3 mb-4 text-sm ${message.includes("สำเร็จ") ? "bg-green-50 border border-green-300 text-green-700" : "bg-[#FCE4E8] border border-[#A31D1D] text-[#A31D1D]"}`}>{message}</div>}

      {renderContent()}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowForm(false)}>
          <div className="bg-white border border-[#FDB813] p-6 w-full max-w-md mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">จองรถ</h3>
            <div className="mb-3"><label className="block text-xs font-medium text-[#1A1A2E] mb-1">ทะเบียนรถ</label><select value={vehicleId} onChange={e => setVehicleId(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB]"><option value="">เลือกรถ</option>{vehicles.map(v => <option key={v.id} value={v.id}>{v.licensePlate}{v.model ? ` (${v.model})` : ""}</option>)}</select></div>
            <div className="mb-3"><label className="block text-xs font-medium text-[#1A1A2E] mb-1">วัตถุประสงค์ *</label><input type="text" value={purpose} onChange={e => setPurpose(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB] focus:outline-none focus:border-[#FDB813]" /></div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">ปลายทาง</label><input type="text" value={destination} onChange={e => setDestination(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB]" /></div>
              <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">จำนวนผู้โดยสาร</label><input type="number" value={passengerCount} onChange={e => setPassengerCount(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB]" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">เวลาเริ่ม</label><input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB]" /></div>
              <div><label className="block text-xs font-medium text-[#1A1A2E] mb-1">เวลาสิ้นสุด</label><input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#D1D5DB]" /></div>
            </div>
            <div className="flex gap-2"><button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 text-sm font-medium border border-[#D1D5DB] text-[#6B7280] hover:bg-gray-100">ยกเลิก</button>
              <button onClick={handleBook} disabled={submitLoading}
                className="flex-1 px-4 py-2.5 text-sm font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800] disabled:opacity-50">{submitLoading ? "กำลังจอง..." : "จองรถ"}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
