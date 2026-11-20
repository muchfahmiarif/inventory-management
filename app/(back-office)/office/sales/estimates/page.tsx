import { desc, eq } from "drizzle-orm";

import { EstimatesList } from "@/components/office/transactions/estimate-views";
import { db } from "@/db";
import { contacts, estimates } from "@/db/schema";

export default async function EstimatesPage() {
  const rows = await db
    .select({
      id: estimates.id,
      number: estimates.number,
      date: estimates.date,
      status: estimates.status,
      customerName: contacts.displayName,
      total: estimates.total,
    })
    .from(estimates)
    .leftJoin(contacts, eq(estimates.contactId, contacts.id))
    .orderBy(desc(estimates.date), desc(estimates.createdAt));

  return <EstimatesList data={rows} title="Estimates" />;
}
