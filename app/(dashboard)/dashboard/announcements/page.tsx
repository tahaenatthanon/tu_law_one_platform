"use client";

import { useState, useEffect } from "react";

type Announcement = { id: string; title: string; content?: string; status: string; publishDate?: string; expireDate?: string; category: { id: number; name: string } };

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/announcements?status=published")
      .then(r => r.json())
      .then(j => { if (j.success) setAnnouncements(j.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const statusLabel = (s: string) => ({ draft: "ฉบับร่าง", published: "เผยแพร่", archived: "เก็บถาวร" }[s] ?? s);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">ระบบประกาศข่าว</h1>
      <p className="text-sm text-[#6B7280] mb-6">ประกาศและข่าวสารทั้งหมดของคณะนิติศาสตร์</p>

      {loading ? <p className="text-[#9CA3AF]">กำลังโหลด...</p> : announcements.length === 0 ? (
        <div className="text-center py-16 text-[#9CA3AF]">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
          <p className="text-sm">ไม่มีประกาศในขณะนี้</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map(a => (
            <div key={a.id} className="bg-white border border-[#D1D5DB] p-4 hover:border-[#FDB813] transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-1.5 py-0.5 bg-[#8B1515] text-white font-medium">{a.category?.name ?? "ทั่วไป"}</span>
                {a.publishDate && <span className="text-xs text-[#9CA3AF]">{new Date(a.publishDate).toLocaleDateString("th-TH")}</span>}
                {a.expireDate && <span className="text-xs text-red-400">หมดเขต {new Date(a.expireDate).toLocaleDateString("th-TH")}</span>}
              </div>
              <h3 className="font-semibold text-[#1A1A2E]">{a.title}</h3>
              {a.content && <p className="text-sm text-[#6B7280] mt-1 line-clamp-2">{a.content}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
