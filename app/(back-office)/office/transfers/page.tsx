import { desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { TransfersList } from "@/components/office/transfers/transfer-views";
import { db } from "@/db";
import { transferOrders, warehouses } from "@/db/schema";

export default async function TransfersPage() {
  const fromW = alias(warehouses, "from_w");
  const toW = alias(warehouses, "to_w");

  const rows = await db
    .select({
      id: transferOrders.id,
      number: transferOrders.number,
      date: transferOrders.date,
      status: transferOrders.status,
      fromWarehouseName: fromW.name,
      toWarehouseName: toW.name,
    })
    .from(transferOrders)
    .leftJoin(fromW, eq(transferOrders.fromWarehouseId, fromW.id))
    .leftJoin(toW, eq(transferOrders.toWarehouseId, toW.id))
    .orderBy(desc(transferOrders.date), desc(transferOrders.createdAt));

  return <TransfersList data={rows} />;
}
