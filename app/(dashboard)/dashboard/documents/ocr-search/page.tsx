"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import RequireRole from "@/components/shared/require-role";
import { Search, FileText, ScanLine, Upload, Loader2 } from "lucide-react";

type OcrResult = { id: string; fileName: string; fileType: string; uploadDate: string; extractedText: string; keywords: string[] };

export default function OcrSearchPage() {
  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as any)?.roles ?? [];
  const canUpload = userRoles.some((r: string) => ["super_admin","system_admin","dean","dept_admin","user"].includes(r));
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<OcrResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");

  const ocrDocs: OcrResult[] = [
    { id: "ocr-1", fileName: "คำสั่งแต่งตั้งกรรมการ_2569.pdf", fileType: "PDF", uploadDate: "2026-07-01", extractedText: "คำสั่งคณะนิติศาสตร์ ที่ 45/2569 เรื่อง แต่งตั้งคณะกรรมการปรับปรุงหลักสูตรนิติศาสตรบัณฑิต...", keywords: ["คำสั่ง", "แต่งตั้ง", "กรรมการ", "หลักสูตร"] },
    { id: "ocr-2", fileName: "รายงานการประชุม_มิถุนายน.docx", fileType: "DOCX", uploadDate: "2026-06-28", extractedText: "รายงานการประชุมคณะกรรมการประจำคณะ ครั้งที่ 5/2569 วันที่ 25 มิถุนายน 2569...", keywords: ["ประชุม", "รายงาน", "คณะกรรมการ"] },
    { id: "ocr-3", fileName: "ข้อบังคับ_การสอบ.pdf", fileType: "PDF", uploadDate: "2026-06-15", extractedText: "ข้อบังคับคณะนิติศาสตร์ ว่าด้วยการสอบไล่และการสอบวัดผล พ.ศ. 2565...", keywords: ["ข้อบังคับ", "สอบ", "วัดผล"] },
    { id: "ocr-4", fileName: "บันทึกข้อความ_งบประมาณ.docx", fileType: "DOCX", uploadDate: "2026-06-10", extractedText: "บันทึกข้อความ ที่ อว 67.12/2569 เรื่อง ขออนุมัติงบประมาณโครงการพัฒนาระบบ...", keywords: ["งบประมาณ", "อนุมัติ", "โครงการ"] },
    { id: "ocr-5", fileName: "ประกาศ_รับสมัครงาน.pdf", fileType: "PDF", uploadDate: "2026-05-20", extractedText: "ประกาศคณะนิติศาสตร์ เรื่อง รับสมัครบุคคลเพื่อสอบคัดเลือกเป็นพนักงาน...", keywords: ["ประกาศ", "รับสมัคร", "พนักงาน"] },
  ];

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setTimeout(() => {
      const q = searchQuery.toLowerCase();
      const filtered = ocrDocs.filter(d =>
        d.fileName.toLowerCase().includes(q) ||
        d.extractedText.toLowerCase().includes(q) ||
        d.keywords.some(k => k.toLowerCase().includes(q))
      );
      setResults(filtered);
      setSearching(false);
      setSearched(true);
    }, 800);
  };

  const handleUpload = () => {
    setUploadMsg("กำลังประมวลผล...");
    setTimeout(() => setUploadMsg("✅ อัปโหลดและทำ OCR สำเร็จ! เอกสารพร้อมค้นหา"), 1500);
  };

  return (
    <RequireRole roles={["super_admin","system_admin","dean","dept_admin","user","viewer"]}>
    <div className="pt-0 px-6 pb-8">
      <div className="flex items-center gap-3 mb-1">
        <ScanLine className="size-6 text-[#A31D1D]" />
        <h1 className="text-2xl font-bold text-[#1A1A2E]">ค้นหาเอกสารด้วย OCR</h1>
      </div>
      <p className="text-sm text-[#6B7280] mb-6">ค้นหาข้อความภายในเอกสาร PDF และ DOCX ด้วยเทคโนโลยี OCR — ระบุคำสำคัญแล้วระบบจะค้นหาทั้งชื่อไฟล์และเนื้อหาภายในเอกสาร</p>

      {/* Search Bar */}
      <div className="bg-white border border-[#D1D5DB] p-4 mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#9CA3AF]" />
            <input
              placeholder="ค้นหาคำในเอกสาร เช่น &quot;คำสั่ง&quot; &quot;งบประมาณ&quot; &quot;ข้อบังคับ&quot;..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#D1D5DB] focus:border-[#A31D1D] focus:ring-1 focus:ring-[#A31D1D]"
            />
          </div>
          <button onClick={handleSearch} disabled={searching}
            className="px-5 py-2.5 text-sm font-semibold bg-[#FDB813] text-[#1A1A2E] hover:bg-[#E5A800] disabled:opacity-50 transition-colors flex items-center gap-2">
            {searching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
            {searching ? "กำลังค้นหา..." : "ค้นหา"}
          </button>
        </div>

        {/* Upload Zone */}
        <div
          className={`mt-4 border-2 border-dashed p-6 text-center transition-colors cursor-pointer ${dragOver ? "border-[#FDB813] bg-[#FFF3CD]" : "border-[#D1D5DB] hover:border-[#A31D1D]"}`}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleUpload(); }}
          onClick={handleUpload}
        >
          <Upload className="size-8 mx-auto mb-2 text-[#9CA3AF]" />
          <p className="text-sm text-[#6B7280]">ลากไฟล์ PDF, DOCX, PPTX, หรือรูปภาพมาวางที่นี่</p>
          <p className="text-[11px] text-[#9CA3AF] mt-0.5">หรือคลิกเพื่อเลือกไฟล์ · รองรับสูงสุด 50MB</p>
        </div>
        {uploadMsg && <p className={`mt-2 text-sm ${uploadMsg.startsWith("✅") ? "text-green-600" : "text-[#6B7280]"}`}>{uploadMsg}</p>}
      </div>

      {/* Results */}
      {searching && (
        <div className="text-center py-12">
          <Loader2 className="size-8 mx-auto mb-3 animate-spin text-[#FDB813]" />
          <p className="text-sm text-[#6B7280]">กำลังค้นหาเอกสาร...</p>
        </div>
      )}

      {searched && !searching && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <p className="text-sm font-medium text-[#1A1A2E]">ผลการค้นหา: {results.length} รายการ</p>
            <span className="text-[11px] text-[#9CA3AF]">สำหรับ &quot;{searchQuery}&quot;</span>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-16 bg-white border border-[#D1D5DB]">
              <FileText className="size-10 mx-auto mb-3 text-[#D1D5DB]" />
              <p className="text-sm text-[#9CA3AF]">ไม่พบเอกสารที่ตรงกับคำค้นหา</p>
              <p className="text-[11px] text-[#9CA3AF] mt-1">ลองเปลี่ยนคำค้นหาหรืออัปโหลดเอกสารใหม่</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map(doc => (
                <div key={doc.id} className="bg-white border border-[#D1D5DB] p-4 hover:border-[#FDB813] transition-colors">
                  <div className="flex items-start gap-3">
                    <FileText className="size-5 mt-0.5 text-[#A31D1D] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-[#1A1A2E]">{doc.fileName}</p>
                        <span className="text-[10px] px-1.5 py-0.5 bg-[#F5F5F5] text-[#6B7280]">{doc.fileType}</span>
                        <span className="text-[10px] text-[#9CA3AF]">{new Date(doc.uploadDate).toLocaleDateString("th-TH")}</span>
                      </div>
                      <p className="text-xs text-[#6B7280] mt-1.5 line-clamp-2">
                        {highlightMatch(doc.extractedText, searchQuery)}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {doc.keywords.map(k => (
                          <span key={k} className={`text-[10px] px-1.5 py-0.5 font-medium ${k.toLowerCase().includes(searchQuery.toLowerCase()) ? "bg-[#FDB813] text-[#1A1A2E]" : "bg-[#F5F5F5] text-[#6B7280]"}`}>
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button className="text-xs text-[#A31D1D] hover:underline shrink-0">เปิดเอกสาร</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!searched && !searching && (
        <div className="bg-white border border-[#D1D5DB] p-6">
          <h3 className="text-sm font-bold text-[#1A1A2E] mb-3">เอกสารล่าสุดที่ทำ OCR</h3>
          <div className="space-y-2">
            {ocrDocs.slice(0, 3).map(doc => (
              <div key={doc.id} className="flex items-center gap-3 py-2 border-b border-[#F5F5F5] last:border-0">
                <FileText className="size-4 text-[#9CA3AF]" />
                <span className="text-sm text-[#1A1A2E] flex-1">{doc.fileName}</span>
                <span className="text-[10px] text-[#9CA3AF]">{new Date(doc.uploadDate).toLocaleDateString("th-TH")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </RequireRole>
  );
}

function highlightMatch(text: string, query: string): string {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  const start = Math.max(0, idx - 30);
  const end = Math.min(text.length, idx + query.length + 50);
  let snippet = (start > 0 ? "..." : "") + text.slice(start, end) + (end < text.length ? "..." : "");
  return snippet;
}
