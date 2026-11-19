import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { StockCountDetail } from "@/components/office/stock-counts/stock-count-views";
import { db } from "@/db";
import { items, stockCountLines, stockCounts, warehouses } from "@/db/schema";

export default async function StockCountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [count] = await db
    .select({
      id: stockCounts.id,
      number: stockCounts.number,
      date: stockCounts.date,
      status: stockCounts.status,
      notes: stockCounts.notes,
      warehouseName: warehouses.name,
    })
    .from(stockCounts)
    .leftJoin(warehouses, eq(stockCounts.warehouseId, warehouses.id))
    .where(eq(stockCounts.id, id));

  if (!count) notFound();

  const lines = await db
    .select({
      id: stockCountLines.id,
      itemName: items.name,
      systemQuantity: stockCountLines.systemQuantity,
      countedQuantity: stockCountLines.countedQuantity,
    })
    .from(stockCountLines)
    .innerJoin(items, eq(stockCountLines.itemId, items.id))
    .where(eq(stockCountLines.stockCountId, id))
    .orderBy(asc(items.name));

  return (
    <StockCountDetail
      data={{
        ...count,
        lines: lines.map((l) => ({
          id: l.id,
          itemName: l.itemName,
          systemQuantity: Number(l.systemQuantity),
          countedQuantity: l.countedQuantity === null ? null : Number(l.countedQuantity),
        })),
      }}
    />
  );
}
