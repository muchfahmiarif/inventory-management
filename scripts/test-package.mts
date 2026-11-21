import "dotenv/config";
import { createPackage } from "../actions/packages";
import { db } from "../db";
import { items, salesOrderLines, salesOrders, warehouses } from "../db/schema";
import { eq } from "drizzle-orm";

const soId = "54a79b7a-5d42-4994-92b6-dc942051177c";
const [soLine] = await db
  .select()
  .from(salesOrderLines)
  .where(eq(salesOrderLines.salesOrderId, soId));
const [w] = await db.select({ id: warehouses.id }).from(warehouses).limit(1);

try {
  await createPackage({
    date: "2026-11-21",
    salesOrderId: soId,
    warehouseId: w.id,
    lines: [{ itemId: soLine.itemId, quantity: 3 }],
  } as any);
  console.log("no-redirect? unexpected");
} catch (e: any) {
  const digest = String(e?.digest ?? "");
  if (digest.includes("NEXT_REDIRECT")) {
    console.log("OK — NEXT_REDIRECT:", digest);
  } else {
    console.log("ERROR:", e?.message ?? e);
  }
}
process.exit(0);
