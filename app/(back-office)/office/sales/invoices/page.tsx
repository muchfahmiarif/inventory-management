import { desc, eq } from "drizzle-orm";

import { InvoicesList } from "@/components/office/transactions/invoice-views";
import { db } from "@/db";
import { contacts, invoices } from "@/db/schema";

export default async function InvoicesPage() {
  const rows = await db
    .select({
      id: invoices.id,
      number: invoices.number,
      date: invoices.date,
      status: invoices.status,
      customerName: contacts.displayName,
      total: invoices.total,
    })
    .from(invoices)
    .leftJoin(contacts, eq(invoices.contactId, contacts.id))
    .orderBy(desc(invoices.date), desc(invoices.createdAt));

  return <InvoicesList data={rows} title="Invoices" />;
}
