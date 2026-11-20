import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { SalesReturnDetail } from "@/components/office/transactions/sales-return-views";
import { db } from "@/db";
import { contacts, items, salesReturnLines, salesReturns, warehouses } from "@/db/schema";

export default async function SalesReturnDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [ret] = await db
    .select({
      id: salesReturns.id,
      number: salesReturns.number,
      date: salesReturns.date,
      status: salesReturns.status,
      reference: salesReturns.reference,
      notes: salesReturns.notes,
      total: salesReturns.total,
      customerName: contacts.displayName,
      warehouseName: warehouses.name,
    })
    .from(salesReturns)
    .leftJoin(contacts, eq(salesReturns.contactId, contacts.id))
    .leftJoin(warehouses, eq(salesReturns.warehouseId, warehouses.id))
    .where(eq(salesReturns.id, id));

  if (!ret) notFound();

  const lines = await db
    .select({
      id: salesReturnLines.id,
      itemName: items.name,
      quantity: salesReturnLines.quantity,
      rate: salesReturnLines.rate,
      amount: salesReturnLines.amount,
    })
    .from(salesReturnLines)
    .innerJoin(items, eq(salesReturnLines.itemId, items.id))
    .where(eq(salesReturnLines.salesReturnId, id))
    .orderBy(asc(salesReturnLines.id));

  return (
    <SalesReturnDetail
      data={{
        ...ret,
        customerName: ret.customerName ?? "Unknown",
        lines: lines.map((l) => ({
          id: l.id,
          itemName: l.itemName,
          quantity: Number(l.quantity),
          rate: Number(l.rate),
          amount: Number(l.amount),
        })),
      }}
    />
  );
}
