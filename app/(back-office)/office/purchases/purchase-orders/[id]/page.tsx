import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { PurchaseOrderDetail } from "@/components/office/transactions/purchase-order-views";
import { db } from "@/db";
import {
  contacts,
  purchaseOrderLines,
  purchaseOrders,
  taxes,
  warehouses,
} from "@/db/schema";

export default async function PurchaseOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [po] = await db
    .select({
      id: purchaseOrders.id,
      number: purchaseOrders.number,
      date: purchaseOrders.date,
      expectedDeliveryDate: purchaseOrders.expectedDeliveryDate,
      status: purchaseOrders.status,
      reference: purchaseOrders.reference,
      notes: purchaseOrders.notes,
      terms: purchaseOrders.terms,
      subtotal: purchaseOrders.subtotal,
      discountTotal: purchaseOrders.discountTotal,
      taxTotal: purchaseOrders.taxTotal,
      total: purchaseOrders.total,
      warehouseName: warehouses.name,
      vendorName: contacts.displayName,
    })
    .from(purchaseOrders)
    .leftJoin(contacts, eq(purchaseOrders.contactId, contacts.id))
    .leftJoin(warehouses, eq(purchaseOrders.warehouseId, warehouses.id))
    .where(eq(purchaseOrders.id, id));

  if (!po) notFound();

  const lines = await db
    .select({
      id: purchaseOrderLines.id,
      itemName: purchaseOrderLines.name,
      quantity: purchaseOrderLines.quantity,
      rate: purchaseOrderLines.rate,
      taxName: taxes.name,
      amount: purchaseOrderLines.amount,
    })
    .from(purchaseOrderLines)
    .leftJoin(taxes, eq(purchaseOrderLines.taxId, taxes.id))
    .where(eq(purchaseOrderLines.purchaseOrderId, id))
    .orderBy(asc(purchaseOrderLines.id));

  return (
    <PurchaseOrderDetail
      data={{
        ...po,
        vendorName: po.vendorName ?? "Unknown",
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
