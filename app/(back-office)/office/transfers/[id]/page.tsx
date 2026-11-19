import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { alias } from "drizzle-orm/pg-core";

import { TransferDetail } from "@/components/office/transfers/transfer-views";
import { db } from "@/db";
import { items, transferOrderLines, transferOrders, warehouses } from "@/db/schema";

export default async function TransferDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fromW = alias(warehouses, "from_w");
  const toW = alias(warehouses, "to_w");

  const [transfer] = await db
    .select({
      id: transferOrders.id,
      number: transferOrders.number,
      date: transferOrders.date,
      status: transferOrders.status,
      notes: transferOrders.notes,
      fromWarehouseName: fromW.name,
      toWarehouseName: toW.name,
    })
    .from(transferOrders)
    .leftJoin(fromW, eq(transferOrders.fromWarehouseId, fromW.id))
    .leftJoin(toW, eq(transferOrders.toWarehouseId, toW.id))
    .where(eq(transferOrders.id, id));

  if (!transfer) notFound();

  const lines = await db
    .select({
      id: transferOrderLines.id,
      itemName: items.name,
      sku: items.sku,
      quantity: transferOrderLines.quantity,
    })
    .from(transferOrderLines)
    .innerJoin(items, eq(transferOrderLines.itemId, items.id))
    .where(eq(transferOrderLines.transferOrderId, id))
    .orderBy(asc(items.name));

  return (
    <TransferDetail
      data={{
        ...transfer,
        lines: lines.map((l) => ({
          id: l.id,
          itemName: l.itemName,
          sku: l.sku,
          quantity: Number(l.quantity),
        })),
      }}
    />
  );
}
