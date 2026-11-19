import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { stockMovements } from "@/db/schema";

// Stock on hand per item (across all warehouses), from the single ledger
export async function getStockByItem(): Promise<Map<string, number>> {
  const rows = await db
    .select({
      itemId: stockMovements.itemId,
      total: sql<number>`coalesce(sum(${stockMovements.quantity}), 0)::float8`,
    })
    .from(stockMovements)
    .groupBy(stockMovements.itemId);
  return new Map(rows.map((r) => [r.itemId, r.total]));
}

// Stock on hand for one item in one warehouse
export async function getStockForItemWarehouse(
  itemId: string,
  warehouseId: string,
): Promise<number> {
  const [row] = await db
    .select({
      total: sql<number>`coalesce(sum(${stockMovements.quantity}), 0)::float8`,
    })
    .from(stockMovements)
    .where(
      sql`${stockMovements.itemId} = ${itemId} and ${stockMovements.warehouseId} = ${warehouseId}`,
    );
  return row?.total ?? 0;
}
