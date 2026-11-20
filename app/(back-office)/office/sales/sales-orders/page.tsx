import { desc, eq } from "drizzle-orm";

import { SalesOrdersList } from "@/components/office/transactions/sales-order-views";
import { db } from "@/db";
import { contacts, salesOrders } from "@/db/schema";

export default async function SalesOrdersPage() {
  const rows = await db
    .select({
      id: salesOrders.id,
      number: salesOrders.number,
      date: salesOrders.date,
      status: salesOrders.status,
      customerName: contacts.displayName,
      total: salesOrders.total,
    })
    .from(salesOrders)
    .leftJoin(contacts, eq(salesOrders.contactId, contacts.id))
    .orderBy(desc(salesOrders.date), desc(salesOrders.createdAt));

  return <SalesOrdersList data={rows} title="Sales Orders" />;
}
