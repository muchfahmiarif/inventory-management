import { desc, eq } from "drizzle-orm";

import { SalesReturnsList } from "@/components/office/transactions/sales-return-views";
import { db } from "@/db";
import { contacts, salesReturns } from "@/db/schema";

export default async function SalesReturnsPage() {
  const rows = await db
    .select({
      id: salesReturns.id,
      number: salesReturns.number,
      date: salesReturns.date,
      status: salesReturns.status,
      customerName: contacts.displayName,
      total: salesReturns.total,
    })
    .from(salesReturns)
    .leftJoin(contacts, eq(salesReturns.contactId, contacts.id))
    .orderBy(desc(salesReturns.date), desc(salesReturns.createdAt));

  return <SalesReturnsList data={rows} title="Sales Returns" />;
}
