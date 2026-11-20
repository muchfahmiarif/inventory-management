import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import TransactionForm from "@/components/office/transactions/transaction-form";
import type { TransactionFormValues } from "@/components/office/transactions/transaction-form";
import { updateSalesOrder } from "@/actions/sales-orders";
import { db } from "@/db";
import { contacts, items, salesOrderLines, salesOrders, taxes } from "@/db/schema";

export default async function EditSalesOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [so] = await db.select().from(salesOrders).where(eq(salesOrders.id, id));
  if (!so) notFound();

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
        itemId: salesOrderLines.itemId,
        description: salesOrderLines.description,
        quantity: salesOrderLines.quantity,
        rate: salesOrderLines.rate,
        discountPercent: salesOrderLines.discountPercent,
        taxId: salesOrderLines.taxId,
      })
      .from(salesOrderLines)
      .where(eq(salesOrderLines.salesOrderId, id))
      .orderBy(asc(salesOrderLines.id)),
  ]);

  const defaults: TransactionFormValues = {
    date: so.date,
    contactId: so.contactId,
    reference: so.reference ?? undefined,
    expiryDate: so.expectedShipmentDate ?? undefined,
    notes: so.notes ?? undefined,
    terms: so.terms ?? undefined,
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
      transactionId={so.id}
      title={`Edit ${so.number}`}
      contactLabel="Customer"
      submitAction={updateSalesOrder.bind(null, so.id)}
      defaultValues={defaults}
      contacts={contactRows}
      items={itemRows}
      taxes={taxRows}
      extraDateLabel="Expected Shipment Date"
      extraDateKey="expiryDate"
    />
  );
}
