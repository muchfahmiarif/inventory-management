import { asc, eq, ne } from "drizzle-orm";

import { TransferForm } from "@/components/office/transfers/transfer-views";
import { db } from "@/db";
import { items, units, warehouses } from "@/db/schema";

export default async function NewTransferPage() {
  const [warehouseRows, itemRows] = await Promise.all([
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
  ]);

  return (
    <TransferForm
      defaultValues={{
        date: new Date().toISOString().slice(0, 10),
        fromWarehouseId: warehouseRows[0]?.id ?? "",
        toWarehouseId: warehouseRows[1]?.id ?? "",
        lines: [{ itemId: "", quantity: "1" }],
      }}
      warehouses={warehouseRows}
      items={itemRows.map((i) => ({ id: i.id, name: i.name, sku: i.sku }))}
    />
  );
}
