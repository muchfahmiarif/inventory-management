"use server";

import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import {
  items,
  purchaseOrderLines,
  purchaseOrders,
  stockMovements,
  taxes,
} from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { nextNumber } from "@/lib/numbering";
import {
  transactionFormSchema,
  type TransactionFormInput,
} from "@/lib/schemas/transactions";

const PATH = "/office/purchases/purchase-orders";

type DbTx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function computeTotals(tx: DbTx, input: z.output<typeof transactionFormSchema>) {
  const taxIds = input.lines.map((l) => l.taxId).filter((t): t is string => !!t);
  const taxRows = taxIds.length
    ? await tx.select({ id: taxes.id, rate: taxes.rate }).from(taxes).where(inArray(taxes.id, taxIds))
    : [];
  const taxRateById = new Map(taxRows.map((t) => [t.id, t.rate]));

  const itemIds = input.lines.map((l) => l.itemId);
  const itemRows = await tx
    .select({ id: items.id, name: items.name })
    .from(items)
    .where(inArray(items.id, itemIds));
  const nameById = new Map(itemRows.map((i) => [i.id, i.name]));

  let subtotal = 0;
  let discountTotal = 0;
  let taxTotal = 0;

  const lines = input.lines.map((l) => {
    const gross = l.quantity * l.rate;
    const discount = gross * ((l.discountPercent ?? 0) / 100);
    const net = gross - discount;
    const rate = l.taxId ? (taxRateById.get(l.taxId) ?? 0) : 0;
    const tax = net * (rate / 100);
    subtotal += gross;
    discountTotal += discount;
    taxTotal += tax;
    return {
      itemId: l.itemId,
      name: nameById.get(l.itemId) ?? "Item",
      description: l.description || null,
      quantity: l.quantity,
      rate: l.rate,
      discountPercent: l.discountPercent ?? 0,
      taxId: l.taxId || null,
      amount: Math.round(net * 100) / 100,
    };
  });

  const total = Math.round((subtotal - discountTotal + taxTotal) * 100) / 100;
  return {
    lines,
    subtotal: Math.round(subtotal * 100) / 100,
    discountTotal: Math.round(discountTotal * 100) / 100,
    taxTotal: Math.round(taxTotal * 100) / 100,
    total,
  };
}

function cleanInput(data: z.output<typeof transactionFormSchema>) {
  return {
    ...data,
    lines: data.lines.map((l) => ({
      ...l,
      taxId: l.taxId && l.taxId !== "none" ? l.taxId : undefined,
    })),
  };
}

export async function createPurchaseOrder(
  input: TransactionFormInput & { warehouseId?: string },
) {
  const parsed = transactionFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const data = cleanInput(parsed.data);

  const id = await db.transaction(async (tx) => {
    const number = await nextNumber(tx, "purchase_orders");
    const totals = await computeTotals(tx, data);

    const [po] = await tx
      .insert(purchaseOrders)
      .values({
        number,
        date: data.date,
        expectedDeliveryDate: data.expiryDate || null,
        contactId: data.contactId,
        warehouseId: data.warehouseId || null,
        reference: data.reference || null,
        notes: data.notes || null,
        terms: data.terms || null,
        status: "open",
        subtotal: totals.subtotal,
        discountTotal: totals.discountTotal,
        taxTotal: totals.taxTotal,
        total: totals.total,
      })
      .returning();

    await tx
      .insert(purchaseOrderLines)
      .values(totals.lines.map((l) => ({ ...l, purchaseOrderId: po.id })));
    return po.id;
  });

  await logActivity({
    action: "created purchase order",
    entityType: "purchase_order",
    entityId: id,
  });

  revalidatePath(PATH);
  redirect(`${PATH}/${id}`);
}

export async function updatePurchaseOrder(
  id: string,
  input: TransactionFormInput & { warehouseId?: string },
) {
  const parsed = transactionFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const data = cleanInput(parsed.data);

  await db.transaction(async (tx) => {
    const totals = await computeTotals(tx, data);
    await tx
      .update(purchaseOrders)
      .set({
        date: data.date,
        expectedDeliveryDate: data.expiryDate || null,
        contactId: data.contactId,
        warehouseId: data.warehouseId || null,
        reference: data.reference || null,
        notes: data.notes || null,
        terms: data.terms || null,
        subtotal: totals.subtotal,
        discountTotal: totals.discountTotal,
        taxTotal: totals.taxTotal,
        total: totals.total,
        updatedAt: new Date(),
      })
      .where(eq(purchaseOrders.id, id));

    await tx.delete(purchaseOrderLines).where(eq(purchaseOrderLines.purchaseOrderId, id));
    await tx
      .insert(purchaseOrderLines)
      .values(totals.lines.map((l) => ({ ...l, purchaseOrderId: id })));
  });

  await logActivity({
    action: "updated purchase order",
    entityType: "purchase_order",
    entityId: id,
  });

  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
  redirect(`${PATH}/${id}`);
}

// Receive Items: stock-in movements for every PO line into the PO's warehouse.
// full=true receives all remaining; partial receives what's given per line.
export async function receivePurchaseOrderItems(
  id: string,
  quantities?: Record<string, number>,
) {
  const [po] = await db
    .select()
    .from(purchaseOrders)
    .where(eq(purchaseOrders.id, id));
  if (!po || po.status === "received" || po.status === "cancelled") return;
  const warehouseId = po.warehouseId;
  if (!warehouseId) throw new Error("Purchase order has no warehouse set");

  const lines = await db
    .select()
    .from(purchaseOrderLines)
    .where(eq(purchaseOrderLines.purchaseOrderId, id));

  await db.transaction(async (tx) => {
    for (const line of lines) {
      const qty = quantities?.[line.itemId] ?? Number(line.quantity);
      if (qty > 0) {
        await tx.insert(stockMovements).values({
          itemId: line.itemId,
          warehouseId,
          quantity: qty,
          sourceType: "purchase_order",
          sourceId: po.id,
          sourceNumber: po.number,
        });
      }
    }

    await tx
      .update(purchaseOrders)
      .set({ status: "received", updatedAt: new Date() })
      .where(eq(purchaseOrders.id, id));
  });

  await logActivity({
    action: "received purchase order items (stock in)",
    entityType: "purchase_order",
    entityId: id,
    entityLabel: po.number,
  });

  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
}

export async function setPurchaseOrderStatus(
  id: string,
  status: "draft" | "open" | "partially_received" | "received" | "billed" | "cancelled",
) {
  await db
    .update(purchaseOrders)
    .set({ status, updatedAt: new Date() })
    .where(eq(purchaseOrders.id, id));
  await logActivity({
    action: `marked purchase order as ${status}`,
    entityType: "purchase_order",
    entityId: id,
  });
  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
}

export async function deletePurchaseOrder(id: string) {
  await db.delete(purchaseOrders).where(eq(purchaseOrders.id, id));
  await logActivity({
    action: "deleted purchase order",
    entityType: "purchase_order",
    entityId: id,
  });
  revalidatePath(PATH);
  redirect(PATH);
}

export async function deletePurchaseOrders(ids: string[]) {
  if (!ids.length) return;
  await db.delete(purchaseOrders).where(inArray(purchaseOrders.id, ids));
  revalidatePath(PATH);
}
