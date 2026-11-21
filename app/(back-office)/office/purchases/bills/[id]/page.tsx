import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { BillDetail } from "@/components/office/transactions/bill-views";
import { db } from "@/db";
import { billLines, bills, contacts, taxes } from "@/db/schema";

export default async function BillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [bill] = await db
    .select({
      id: bills.id,
      number: bills.number,
      date: bills.date,
      dueDate: bills.dueDate,
      status: bills.status,
      reference: bills.reference,
      notes: bills.notes,
      terms: bills.terms,
      subtotal: bills.subtotal,
      discountTotal: bills.discountTotal,
      taxTotal: bills.taxTotal,
      total: bills.total,
      amountPaid: bills.amountPaid,
      vendorName: contacts.displayName,
    })
    .from(bills)
    .leftJoin(contacts, eq(bills.contactId, contacts.id))
    .where(eq(bills.id, id));

  if (!bill) notFound();

  const lines = await db
    .select({
      id: billLines.id,
      itemName: billLines.name,
      quantity: billLines.quantity,
      rate: billLines.rate,
      taxName: taxes.name,
      amount: billLines.amount,
    })
    .from(billLines)
    .leftJoin(taxes, eq(billLines.taxId, taxes.id))
    .where(eq(billLines.billId, id))
    .orderBy(asc(billLines.id));

  return (
    <BillDetail
      data={{
        ...bill,
        vendorName: bill.vendorName ?? "Unknown",
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
