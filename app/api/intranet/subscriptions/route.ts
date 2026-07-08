import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, success, error } from "@/lib/api-utils";

// GET: fetch user's subscriptions
export async function GET(req: NextRequest) {
  const user = await requireAuth();
  try {
    const subs = await prisma.announcementSubscription.findMany({
      where: { userId: user.id },
      include: {
        category: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    });
    return success(subs);
  } catch {
    return error("INTERNAL", "ไม่สามารถดึงข้อมูลการติดตามได้");
  }
}

// POST: subscribe
export async function POST(req: NextRequest) {
  const user = await requireAuth();
  try {
    const body = await req.json();
    const { categoryId, departmentId } = body;
    const userId = user.id;

    // Check existing
    const existing = await prisma.announcementSubscription.findFirst({
      where: { userId, ...(categoryId ? { categoryId } : {}), ...(departmentId ? { departmentId } : {}) },
    });
    if (existing) {
      const updated = await prisma.announcementSubscription.update({
        where: { id: existing.id },
        data: { isSubscribed: true },
      });
      return success(updated);
    }

    const sub = await prisma.announcementSubscription.create({
      data: { userId, categoryId: categoryId ?? null, departmentId: departmentId ?? null, isSubscribed: true },
    });
    return success(sub);
  } catch {
    return error("INTERNAL", "ไม่สามารถบันทึกการติดตามได้");
  }
}

// DELETE: unsubscribe
export async function DELETE(req: NextRequest) {
  const user = await requireAuth();
  try {
    const body = await req.json();
    const { categoryId, departmentId } = body;
    const userId = user.id;

    const existing = await prisma.announcementSubscription.findFirst({
      where: { userId, ...(categoryId ? { categoryId } : {}), ...(departmentId ? { departmentId } : {}) },
    });
    if (!existing) return error("NOT_FOUND", "ไม่พบข้อมูลการติดตาม", 404);

    await prisma.announcementSubscription.update({
      where: { id: existing.id },
      data: { isSubscribed: false },
    });
    return success({ message: "ยกเลิกการติดตามแล้ว" });
  } catch {
    return error("INTERNAL", "ไม่สามารถยกเลิกการติดตามได้");
  }
}
