import { desc, eq } from "drizzle-orm";

import { DeliverChallansList } from "@/components/office/transactions/deliver-challan-views";
import { db } from "@/db";
import { contacts, deliverChallans } from "@/db/schema";

export default async function DeliverChallansPage() {
  const rows = await db
    .select({
      id: deliverChallans.id,
      number: deliverChallans.number,
      date: deliverChallans.date,
      status: deliverChallans.status,
      customerName: contacts.displayName,
      total: deliverChallans.total,
    })
    .from(deliverChallans)
    .leftJoin(contacts, eq(deliverChallans.contactId, contacts.id))
    .orderBy(desc(deliverChallans.date), desc(deliverChallans.createdAt));

  return <DeliverChallansList data={rows} title="Deliver Challans" />;
}
