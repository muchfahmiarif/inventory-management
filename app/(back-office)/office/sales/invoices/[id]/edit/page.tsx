import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import TransactionForm from "@/components/office/transactions/transaction-form";
import type { TransactionFormValues } from "@/components/office/transactions/transaction-form";
import { updateInvoice } from "@/actions/invoices";
import { db } from "@/db";
import { contacts, invoiceLines, invoices, items, taxes } from "@/db/schema";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
  if (!invoice) notFound();

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
        itemId: invoiceLines.itemId,
        description: invoiceLines.description,
        quantity: invoiceLines.quantity,
        rate: invoiceLines.rate,
        discountPercent: invoiceLines.discountPercent,
        taxId: invoiceLines.taxId,
      })
      .from(invoiceLines)
      .where(eq(invoiceLines.invoiceId, id))
      .orderBy(asc(invoiceLines.id)),
  ]);

  const defaults: TransactionFormValues = {
    date: invoice.date,
    contactId: invoice.contactId,
    reference: invoice.reference ?? undefined,
    expiryDate: invoice.dueDate ?? undefined,
    notes: invoice.notes ?? undefined,
    terms: invoice.terms ?? undefined,
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
      transactionId={invoice.id}
      title={`Edit ${invoice.number}`}
      contactLabel="Customer"
      submitAction={updateInvoice.bind(null, invoice.id)}
      defaultValues={defaults}
      contacts={contactRows}
      items={itemRows}
      taxes={taxRows}
      extraDateLabel="Due Date"
      extraDateKey="expiryDate"
    />
  );
}
