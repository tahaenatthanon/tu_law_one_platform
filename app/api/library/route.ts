import { NextRequest } from "next/server";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

const RESOURCES = [
  { id: "lib-1", title: "ประมวลกฎหมายแพ่งและพาณิชย์", author: "สำนักพิมพ์วิญญูชน", barcode: "LB-001", resourceType: "หนังสือ", category: "กฎหมาย", isActive: true, status: "available" },
  { id: "lib-2", title: "คำอธิบายกฎหมายอาญา", author: "ศาสตราจารย์ ดร.คณิต ณ นคร", barcode: "LB-002", resourceType: "หนังสือ", category: "กฎหมาย", isActive: true, status: "borrowed" },
  { id: "lib-3", title: "วารสารนิติศาสตร์ ปีที่ 45", author: "คณะนิติศาสตร์ มธ.", barcode: "LB-003", resourceType: "วารสาร", category: "วารสาร", isActive: true, status: "available" },
  { id: "lib-4", title: "Research Methods in Law", author: "Mike McConville", barcode: "LB-004", resourceType: "หนังสือ", category: "วิจัย", isActive: true, status: "available" },
];

export async function GET(req: NextRequest) {
  await requireAuth();
  try {
    const { page, limit } = parsePagination(req);
    const url = new URL(req.url);
    const q = url.searchParams.get("q") ?? "";
    const type = url.searchParams.get("type");
    const category = url.searchParams.get("category");

    let filtered = RESOURCES;
    if (q) filtered = filtered.filter(r => r.title.includes(q) || r.author.includes(q) || r.barcode.includes(q));
    if (type) filtered = filtered.filter(r => r.resourceType === type);
    if (category) filtered = filtered.filter(r => r.category === category);

    const start = ((page || 1) - 1) * (limit || 20);
    return success(filtered.slice(start, start + (limit || 20)), { total: filtered.length, page: page || 1, limit: limit || 20 });
  } catch { return error("INTERNAL", "ไม่สามารถสืบค้นทรัพยากรได้"); }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  try {
    const body = await req.json();
    return success({ id: `lib-${Date.now()}`, ...body, status: "borrowed" });
  } catch { return error("INTERNAL", "ไม่สามารถดำเนินการได้"); }
}
