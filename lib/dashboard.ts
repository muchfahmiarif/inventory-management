import { and, inArray, sql } from "drizzle-orm";

import { db } from "@/db";
import { salesOrders, stockMovements } from "@/db/schema";

// Dashboard "Sales Activity" + "Inventory Summary", fed by real records.
// Mapping for the modules built so far:
// - To be packed   = confirmed sales orders
// - To be shipped  = packed sales orders
// - To be delivered = shipped sales orders
// - To be invoiced  = confirmed/packed/shipped orders not yet invoiced
export async function getDashboardStats() {
  const countByStatus = await db
    .select({ status: salesOrders.status, count: sql<number>`count(*)::int` })
    .from(salesOrders)
    .groupBy(salesOrders.status);
  const byStatus = Object.fromEntries(countByStatus.map((r) => [r.status, r.count]));

  const [stock] = await db
    .select({
      inHand: sql<number>`coalesce(sum(${stockMovements.quantity}), 0)::float8`,
    })
    .from(stockMovements);

  const [toBeInvoiced] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(salesOrders)
    .where(
      and(
        inArray(salesOrders.status, ["confirmed", "packed", "shipped"]),
        sql`${salesOrders.status} <> 'invoiced'`,
      ),
    );

  return {
    toBePacked: byStatus["confirmed"] ?? 0,
    toBeShipped: byStatus["packed"] ?? 0,
    toBeDelivered: byStatus["shipped"] ?? 0,
    toBeInvoiced: toBeInvoiced?.count ?? 0,
    quantityInHand: stock?.inHand ?? 0,
    // Purchase orders module (Phase 4) will feed this
    quantityToBeReceived: 0,
  };
}
