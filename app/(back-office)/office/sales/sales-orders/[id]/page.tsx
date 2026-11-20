import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { SalesOrderDetail } from "@/components/office/transactions/sales-order-views";
import { db } from "@/db";
import { contacts, salesOrderLines, salesOrders, taxes } from "@/db/schema";

export default async function SalesOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [so] = await db
    .select({
      id: salesOrders.id,
      number: salesOrders.number,
      date: salesOrders.date,
      expectedShipmentDate: salesOrders.expectedShipmentDate,
      status: salesOrders.status,
      reference: salesOrders.reference,
      notes: salesOrders.notes,
      terms: salesOrders.terms,
      subtotal: salesOrders.subtotal,
      discountTotal: salesOrders.discountTotal,
      taxTotal: salesOrders.taxTotal,
      total: salesOrders.total,
      customerName: contacts.displayName,
    })
    .from(salesOrders)
    .leftJoin(contacts, eq(salesOrders.contactId, contacts.id))
    .where(eq(salesOrders.id, id));

  if (!so) notFound();

  const lines = await db
    .select({
      id: salesOrderLines.id,
      itemName: salesOrderLines.name,
      quantity: salesOrderLines.quantity,
      rate: salesOrderLines.rate,
      taxName: taxes.name,
      amount: salesOrderLines.amount,
    })
    .from(salesOrderLines)
    .leftJoin(taxes, eq(salesOrderLines.taxId, taxes.id))
    .where(eq(salesOrderLines.salesOrderId, id))
    .orderBy(asc(salesOrderLines.id));

  return (
    <SalesOrderDetail
      data={{
        ...so,
        customerName: so.customerName ?? "Unknown",
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
