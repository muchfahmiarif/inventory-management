import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { DeliverChallanDetail } from "@/components/office/transactions/deliver-challan-views";
import { db } from "@/db";
import { contacts, deliverChallanLines, deliverChallans } from "@/db/schema";

export default async function DeliverChallanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [challan] = await db
    .select({
      id: deliverChallans.id,
      number: deliverChallans.number,
      date: deliverChallans.date,
      status: deliverChallans.status,
      reference: deliverChallans.reference,
      notes: deliverChallans.notes,
      total: deliverChallans.total,
      customerName: contacts.displayName,
    })
    .from(deliverChallans)
    .leftJoin(contacts, eq(deliverChallans.contactId, contacts.id))
    .where(eq(deliverChallans.id, id));

  if (!challan) notFound();

  const lines = await db
    .select({
      id: deliverChallanLines.id,
      itemName: deliverChallanLines.name,
      quantity: deliverChallanLines.quantity,
      rate: deliverChallanLines.rate,
      amount: deliverChallanLines.amount,
    })
    .from(deliverChallanLines)
    .where(eq(deliverChallanLines.challanId, id))
    .orderBy(asc(deliverChallanLines.id));

  return (
    <DeliverChallanDetail
      data={{
        ...challan,
        customerName: challan.customerName ?? "Unknown",
        lines: lines.map((l) => ({
          ...l,
          quantity: Number(l.quantity),
          rate: Number(l.rate),
          amount: Number(l.amount),
        })),
      }}
    />
  );
}
