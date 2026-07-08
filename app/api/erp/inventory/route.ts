import { NextRequest } from "next/server";
import { requireAuth, success, error, parsePagination } from "@/lib/api-utils";

const ITEMS = [{ id: "inv-1", itemCode: "MAT-001", name: "กระดาษ A4", category: "เครื่องเขียน", unit: "รีม", unitPrice: 120, minStock: 50 }];
const STOCKS = [{ itemId: "inv-1", locationName: "คลังกลาง", quantity: 200, item: { name: "กระดาษ A4" } }];
const TRANSACTIONS = [{ id: "tx-1", itemName: "กระดาษ A4", transactionType: "รับเข้า", quantity: 50, transactionDate: "2569-07-01", referenceDoc: "PR-001" }];
const CATEGORIES = [{ id: 1, name: "เครื่องเขียน", itemCount: 2 }, { id: 2, name: "วัสดุคอมพิวเตอร์", itemCount: 1 }];

export async function GET(req: NextRequest) {
  await requireAuth();
  try {
    const { page, limit } = parsePagination(req);
    const type = new URL(req.url).searchParams.get("type");
    let data: unknown[] = ITEMS;
    if (type === "stocks") data = STOCKS;
    else if (type === "transactions") data = TRANSACTIONS;
    else if (type === "categories") data = CATEGORIES;
    const start = ((page || 1) - 1) * (limit || 20);
    return success(data.slice(start, start + (limit || 20)), { total: data.length, page: page || 1, limit: limit || 20 });
  } catch { return error("INTERNAL", "ไม่สามารถดึงข้อมูลพัสดุ ERP ได้"); }
}
