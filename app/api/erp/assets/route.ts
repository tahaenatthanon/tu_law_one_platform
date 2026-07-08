import { NextRequest } from "next/server";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  await requireAuth();
  try {
    const { page, limit, skip } = parsePagination(req);
    const url = new URL(req.url);
    const type = url.searchParams.get("type");

    if (type === "maintenance") {
      const [data, total] = await Promise.all([
        prisma.erpAssetMaintenance.findMany({ skip, take: limit, include: { asset: true }, orderBy: { createdAt: "desc" } }),
        prisma.erpAssetMaintenance.count(),
      ]);
      return success(data, { total, page, limit });
    }
    if (type === "depreciation") {
      const [data, total] = await Promise.all([
        prisma.erpAssetDepreciation.findMany({ skip, take: limit, include: { asset: true }, orderBy: { createdAt: "desc" } }),
        prisma.erpAssetDepreciation.count(),
      ]);
      return success(data, { total, page, limit });
    }

    const [data, total] = await Promise.all([
      prisma.erpAsset.findMany({ skip, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.erpAsset.count(),
    ]);
    return success(data, { total, page, limit });
  } catch { return error("INTERNAL", "ไม่สามารถดึงข้อมูลครุภัณฑ์ได้"); }
}
