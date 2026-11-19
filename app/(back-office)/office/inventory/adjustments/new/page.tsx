import { asc, eq, ne } from "drizzle-orm";

import AdjustmentForm from "@/components/office/inventory/adjustments/adjustment-form";
import { db } from "@/db";
import { items, units, warehouses } from "@/db/schema";
import { getStockByItem } from "@/lib/stock";

export default async function NewAdjustmentPage() {
  const [warehouseRows, itemRows, stockMap] = await Promise.all([
    db
      .select({ id: warehouses.id, name: warehouses.name })
      .from(warehouses)
      .orderBy(asc(warehouses.name)),
    db
      .select({
        id: items.id,
        name: items.name,
        sku: items.sku,
        unitName: units.name,
        type: items.type,
      })
      .from(items)
      .leftJoin(units, eq(items.unitId, units.id))
      .where(ne(items.type, "service"))
      .orderBy(asc(items.name)),
    getStockByItem(),
  ]);
  return (
    <AdjustmentForm
      defaultValues={{
        date: new Date().toISOString().slice(0, 10),
        warehouseId: warehouseRows[0]?.id ?? "",
        lines: [{ itemId: "", systemQuantity: "0", adjustedQuantity: "0" }],
      }}
      warehouses={warehouseRows}
      items={itemRows.map((i) => ({
        id: i.id,
        name: i.name,
        sku: i.sku,
        unitName: i.unitName,
      }))}
      stockByItem={Object.fromEntries(stockMap)}
    />
  );
}
