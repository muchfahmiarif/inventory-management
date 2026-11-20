import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import TransactionForm from "@/components/office/transactions/transaction-form";
import type { TransactionFormValues } from "@/components/office/transactions/transaction-form";
import { updateEstimate } from "@/actions/estimates";
import { db } from "@/db";
import { contacts, estimateLines, estimates, items, taxes } from "@/db/schema";

export default async function EditEstimatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [estimate] = await db.select().from(estimates).where(eq(estimates.id, id));
  if (!estimate) notFound();

  const [contactRows, itemRows, taxRows, lineRows] = await Promise.all([
    db
      .select({ id: contacts.id, name: contacts.displayName })
      .from(contacts)
      .where(eq(contacts.type, "customer"))
      .orderBy(asc(contacts.displayName)),
    db
      .select({ id: items.id, name: items.name, sellingPrice: items.sellingPrice })
      .from(items)
      .orderBy(asc(items.name)),
    db.select({ id: taxes.id, name: taxes.name, rate: taxes.rate }).from(taxes).orderBy(asc(taxes.name)),
    db
      .select({
        itemId: estimateLines.itemId,
        description: estimateLines.description,
        quantity: estimateLines.quantity,
        rate: estimateLines.rate,
        discountPercent: estimateLines.discountPercent,
        taxId: estimateLines.taxId,
      })
      .from(estimateLines)
      .where(eq(estimateLines.estimateId, id))
      .orderBy(asc(estimateLines.id)),
  ]);

  const defaults: TransactionFormValues = {
    date: estimate.date,
    contactId: estimate.contactId,
    reference: estimate.reference ?? undefined,
    expiryDate: estimate.expiryDate ?? undefined,
    notes: estimate.notes ?? undefined,
    terms: estimate.terms ?? undefined,
    lines: lineRows.map((l) => ({
      itemId: l.itemId,
      description: l.description ?? undefined,
      quantity: String(l.quantity),
      rate: String(l.rate),
      discountPercent: String(l.discountPercent),
      taxId: l.taxId ?? "none",
    })),
  };

  return (
    <TransactionForm
      mode="edit"
      transactionId={estimate.id}
      title={`Edit ${estimate.number}`}
      contactLabel="Customer"
      submitAction={updateEstimate.bind(null, estimate.id)}
      defaultValues={defaults}
      contacts={contactRows}
      items={itemRows}
      taxes={taxRows}
      extraDateLabel="Expiry Date"
      extraDateKey="expiryDate"
    />
  );
}
