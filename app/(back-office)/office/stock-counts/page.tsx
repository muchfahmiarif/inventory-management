import { desc, eq } from "drizzle-orm";

import { StockCountsList } from "@/components/office/stock-counts/stock-count-views";
import { db } from "@/db";
import { stockCounts, warehouses } from "@/db/schema";

export default async function StockCountsPage() {
  const rows = await db
    .select({
      id: stockCounts.id,
      number: stockCounts.number,
      date: stockCounts.date,
      status: stockCounts.status,
      warehouseName: warehouses.name,
    })
    .from(stockCounts)
    .leftJoin(warehouses, eq(stockCounts.warehouseId, warehouses.id))
    .orderBy(desc(stockCounts.date), desc(stockCounts.createdAt));

  return <StockCountsList data={rows} />;
}
