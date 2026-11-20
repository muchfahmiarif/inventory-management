import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { InvoiceDetail } from "@/components/office/transactions/invoice-views";
import { db } from "@/db";
import { contacts, invoiceLines, invoices, taxes } from "@/db/schema";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [invoice] = await db
    .select({
      id: invoices.id,
      number: invoices.number,
      date: invoices.date,
      dueDate: invoices.dueDate,
      status: invoices.status,
      reference: invoices.reference,
      notes: invoices.notes,
      terms: invoices.terms,
      subtotal: invoices.subtotal,
      discountTotal: invoices.discountTotal,
      taxTotal: invoices.taxTotal,
      total: invoices.total,
      amountPaid: invoices.amountPaid,
      customerName: contacts.displayName,
    })
    .from(invoices)
    .leftJoin(contacts, eq(invoices.contactId, contacts.id))
    .where(eq(invoices.id, id));

  if (!invoice) notFound();

  const lines = await db
    .select({
      id: invoiceLines.id,
      itemName: invoiceLines.name,
      description: invoiceLines.description,
      quantity: invoiceLines.quantity,
      rate: invoiceLines.rate,
      discountPercent: invoiceLines.discountPercent,
      taxName: taxes.name,
      amount: invoiceLines.amount,
    })
    .from(invoiceLines)
    .leftJoin(taxes, eq(invoiceLines.taxId, taxes.id))
    .where(eq(invoiceLines.invoiceId, id))
    .orderBy(asc(invoiceLines.id));

  return (
    <InvoiceDetail
      data={{
        ...invoice,
        customerName: invoice.customerName ?? "Unknown",
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
