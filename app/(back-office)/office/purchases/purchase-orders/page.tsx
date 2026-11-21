import { desc, eq } from "drizzle-orm";

import { PurchaseOrdersList } from "@/components/office/transactions/purchase-order-views";
import { db } from "@/db";
import { contacts, purchaseOrders } from "@/db/schema";

export default async function PurchaseOrdersPage() {
  const rows = await db
    .select({
      id: purchaseOrders.id,
      number: purchaseOrders.number,
      date: purchaseOrders.date,
      status: purchaseOrders.status,
      vendorName: contacts.displayName,
      total: purchaseOrders.total,
    })
    .from(purchaseOrders)
    .leftJoin(contacts, eq(purchaseOrders.contactId, contacts.id))
    .orderBy(desc(purchaseOrders.date), desc(purchaseOrders.createdAt));

  return <PurchaseOrdersList data={rows} title="Purchase Orders" />;
}
