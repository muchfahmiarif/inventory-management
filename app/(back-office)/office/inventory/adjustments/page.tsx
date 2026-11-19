import { desc, eq } from "drizzle-orm";

import { AdjustmentsList } from "@/components/office/inventory/adjustments/adjustment-views";
import { db } from "@/db";
import { inventoryAdjustments, warehouses } from "@/db/schema";

export default async function AdjustmentsPage() {
  const rows = await db
    .select({
      id: inventoryAdjustments.id,
      number: inventoryAdjustments.number,
      date: inventoryAdjustments.date,
      reference: inventoryAdjustments.reference,
      reason: inventoryAdjustments.reason,
      warehouseName: warehouses.name,
    })
    .from(inventoryAdjustments)
    .leftJoin(warehouses, eq(inventoryAdjustments.warehouseId, warehouses.id))
    .orderBy(desc(inventoryAdjustments.date), desc(inventoryAdjustments.createdAt));

  return <AdjustmentsList data={rows} title="All Adjustments" />;
}
