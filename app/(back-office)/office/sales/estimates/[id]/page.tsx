import { asc, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { EstimateDetail } from "@/components/office/transactions/estimate-views";
import { db } from "@/db";
import { contacts, estimateLines, estimates, taxes } from "@/db/schema";

export default async function EstimateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [estimate] = await db
    .select({
      id: estimates.id,
      number: estimates.number,
      date: estimates.date,
      expiryDate: estimates.expiryDate,
      status: estimates.status,
      reference: estimates.reference,
      notes: estimates.notes,
      terms: estimates.terms,
      subtotal: estimates.subtotal,
      discountTotal: estimates.discountTotal,
      taxTotal: estimates.taxTotal,
      total: estimates.total,
      customerName: contacts.displayName ?? "Unknown",
    })
    .from(estimates)
    .leftJoin(contacts, eq(estimates.contactId, contacts.id))
    .where(eq(estimates.id, id));

  if (!estimate) notFound();

  const lines = await db
    .select({
      id: estimateLines.id,
      itemName: estimateLines.name,
      description: estimateLines.description,
      quantity: estimateLines.quantity,
      rate: estimateLines.rate,
      discountPercent: estimateLines.discountPercent,
      taxName: taxes.name,
      amount: estimateLines.amount,
    })
    .from(estimateLines)
    .leftJoin(taxes, eq(estimateLines.taxId, taxes.id))
    .where(eq(estimateLines.estimateId, id))
    .orderBy(asc(estimateLines.id));

  return (
    <EstimateDetail
      data={{
        ...estimate,
        customerName: estimate.customerName ?? "Unknown",
        lines: lines.map((l) => ({
          ...l,
          quantity: Number(l.quantity),
          rate: Number(l.rate),
          discountPercent: Number(l.discountPercent),
          amount: Number(l.amount),
        })),
      }}
    />
  );
}
