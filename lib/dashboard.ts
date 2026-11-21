import { and, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/db";
import { packages, salesOrders, shipments, stockMovements } from "@/db/schema";

// Dashboard "Sales Activity" + "Inventory Summary", fed by real records.
// Mapping with the full SO→Package→Shipment chain:
// - To be packed    = confirmed sales orders (not yet packed)
// - To be shipped   = draft packages (packed, waiting for shipment)
// - To be delivered = shipped shipments (in transit, not delivered)
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

  const [toBeShipped] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(packages)
    .where(eq(packages.status, "draft"));

  const [toBeDelivered] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(shipments)
    .where(eq(shipments.status, "shipped"));

  return {
    toBePacked: byStatus["confirmed"] ?? 0,
    toBeShipped: toBeShipped?.count ?? 0,
    toBeDelivered: toBeDelivered?.count ?? 0,
    toBeInvoiced: toBeInvoiced?.count ?? 0,
    quantityInHand: stock?.inHand ?? 0,
    // Purchase orders module (Phase 4) will feed this
    quantityToBeReceived: 0,
  };
}
