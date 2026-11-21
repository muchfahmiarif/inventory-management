import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import TransactionForm from "@/components/office/transactions/transaction-form";
import type { TransactionFormValues } from "@/components/office/transactions/transaction-form";
import { updateBill } from "@/actions/bills";
import { db } from "@/db";
import { billLines, bills, contacts, items, taxes } from "@/db/schema";

export default async function EditBillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [bill] = await db.select().from(bills).where(eq(bills.id, id));
  if (!bill) notFound();

  const [contactRows, itemRows, taxRows, lineRows] = await Promise.all([
    db
      .select({ id: contacts.id, name: contacts.displayName })
      .from(contacts)
      .where(eq(contacts.type, "vendor"))
      .orderBy(asc(contacts.displayName)),
    db
      .select({ id: items.id, name: items.name, sellingPrice: items.costPrice })
      .from(items)
      .orderBy(asc(items.name)),
    db.select({ id: taxes.id, name: taxes.name, rate: taxes.rate }).from(taxes).orderBy(asc(taxes.name)),
    db
      .select({
        itemId: billLines.itemId,
        description: billLines.description,
        quantity: billLines.quantity,
        rate: billLines.rate,
        discountPercent: billLines.discountPercent,
        taxId: billLines.taxId,
      })
      .from(billLines)
      .where(eq(billLines.billId, id))
      .orderBy(asc(billLines.id)),
  ]);

  const defaults: TransactionFormValues = {
    date: bill.date,
    contactId: bill.contactId,
    reference: bill.reference ?? undefined,
    expiryDate: bill.dueDate ?? undefined,
    notes: bill.notes ?? undefined,
    terms: bill.terms ?? undefined,
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
      transactionId={bill.id}
      title={`Edit ${bill.number}`}
      contactLabel="Vendor"
      submitAction={updateBill.bind(null, bill.id)}
      defaultValues={defaults}
      contacts={contactRows}
      items={itemRows}
      taxes={taxRows}
      extraDateLabel="Due Date"
      extraDateKey="expiryDate"
    />
  );
}
