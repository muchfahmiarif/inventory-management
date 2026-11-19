import { asc, ne } from "drizzle-orm";

import { StockCountForm } from "@/components/office/stock-counts/stock-count-views";
import { db } from "@/db";
import { items, warehouses } from "@/db/schema";
import { getStockByItem } from "@/lib/stock";

export default async function NewStockCountPage() {
  const [warehouseRows, itemRows, stockMap] = await Promise.all([
    db
      .select({ id: warehouses.id, name: warehouses.name })
      .from(warehouses)
      .orderBy(asc(warehouses.name)),
    db
      .select({ id: items.id, name: items.name, sku: items.sku, type: items.type })
      .from(items)
      .where(ne(items.type, "service"))
      .orderBy(asc(items.name)),
    getStockByItem(),
  ]);

  return (
    <StockCountForm
      defaultValues={{
        date: new Date().toISOString().slice(0, 10),
        warehouseId: warehouseRows[0]?.id ?? "",
        lines: [{ itemId: "", countedQuantity: "" }],
      }}
      warehouses={warehouseRows}
      items={itemRows.map((i) => ({ id: i.id, name: i.name, sku: i.sku }))}
      stockByItem={Object.fromEntries(stockMap)}
    />
  );
}
