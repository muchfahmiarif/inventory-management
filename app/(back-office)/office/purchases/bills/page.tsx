import { desc, eq } from "drizzle-orm";

import { BillsList } from "@/components/office/transactions/bill-views";
import { db } from "@/db";
import { bills, contacts } from "@/db/schema";

export default async function BillsPage() {
  const rows = await db
    .select({
      id: bills.id,
      number: bills.number,
      date: bills.date,
      status: bills.status,
      vendorName: contacts.displayName,
      total: bills.total,
    })
    .from(bills)
    .leftJoin(contacts, eq(bills.contactId, contacts.id))
    .orderBy(desc(bills.date), desc(bills.createdAt));

  return <BillsList data={rows} title="Bills" />;
}
