import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import TransactionForm from "@/components/office/transactions/transaction-form";
import type { TransactionFormValues } from "@/components/office/transactions/transaction-form";
import { updatePurchaseOrder } from "@/actions/purchase-orders";
import { db } from "@/db";
import {
  contacts,
  items,
  purchaseOrderLines,
  purchaseOrders,
  taxes,
  warehouses,
} from "@/db/schema";

export default async function EditPurchaseOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [po] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id));
  if (!po) notFound();

  const [contactRows, itemRows, taxRows, warehouseRows, lineRows] = await Promise.all([
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
      .select({ id: warehouses.id, name: warehouses.name })
      .from(warehouses)
      .orderBy(asc(warehouses.name)),
    db
      .select({
        itemId: purchaseOrderLines.itemId,
        description: purchaseOrderLines.description,
        quantity: purchaseOrderLines.quantity,
        rate: purchaseOrderLines.rate,
        discountPercent: purchaseOrderLines.discountPercent,
        taxId: purchaseOrderLines.taxId,
      })
      .from(purchaseOrderLines)
      .where(eq(purchaseOrderLines.purchaseOrderId, id))
      .orderBy(asc(purchaseOrderLines.id)),
  ]);

  const defaults: TransactionFormValues = {
    date: po.date,
    contactId: po.contactId,
    warehouseId: po.warehouseId ?? undefined,
    reference: po.reference ?? undefined,
    expiryDate: po.expectedDeliveryDate ?? undefined,
    notes: po.notes ?? undefined,
    terms: po.terms ?? undefined,
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
      transactionId={po.id}
      title={`Edit ${po.number}`}
      contactLabel="Vendor"
      submitAction={updatePurchaseOrder.bind(null, po.id)}
      defaultValues={defaults}
      contacts={contactRows}
      items={itemRows}
      taxes={taxRows}
      extraDateLabel="Expected Delivery Date"
      extraDateKey="expiryDate"
      warehouse={{ label: "Deliver To Warehouse", options: warehouseRows }}
    />
  );
}
