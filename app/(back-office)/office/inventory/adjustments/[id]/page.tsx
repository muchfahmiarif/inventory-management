import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { AdjustmentDetail } from "@/components/office/inventory/adjustments/adjustment-views";
import { db } from "@/db";
import { inventoryAdjustmentLines, inventoryAdjustments, items, warehouses } from "@/db/schema";

export default async function AdjustmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [adj] = await db
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
    .where(eq(inventoryAdjustments.id, id));

  if (!adj) notFound();

  const lines = await db
    .select({
      id: inventoryAdjustmentLines.id,
      itemName: items.name,
      sku: items.sku,
      systemQuantity: inventoryAdjustmentLines.systemQuantity,
      adjustedQuantity: inventoryAdjustmentLines.adjustedQuantity,
    })
    .from(inventoryAdjustmentLines)
    .innerJoin(items, eq(inventoryAdjustmentLines.itemId, items.id))
    .where(eq(inventoryAdjustmentLines.adjustmentId, id))
    .orderBy(asc(items.name));

  return (
    <AdjustmentDetail
      data={{
        ...adj,
        lines: lines.map((l) => ({
          id: l.id,
          itemName: l.itemName,
          sku: l.sku,
          systemQuantity: Number(l.systemQuantity),
          adjustedQuantity: Number(l.adjustedQuantity),
        })),
      }}
    />
  );
}
