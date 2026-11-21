"use server";

import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import {
  estimateLines,
  estimates,
  invoices,
  invoiceLines,
  items,
  salesOrderLines,
  salesOrders,
  taxes,
} from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { nextNumber } from "@/lib/numbering";
import {
  transactionFormSchema,
  type TransactionFormInput,
} from "@/lib/schemas/transactions";

const PATH = "/office/sales/estimates";

// Recompute line amounts and totals server-side (authoritative)
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

type DbTx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function createEstimate(input: TransactionFormInput) {
  const parsed = transactionFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const data = parsed.data;

  const id = await db.transaction(async (tx) => {
    const number = await nextNumber(tx, "estimates");
    const totals = await computeTotals(tx, data);

    const [estimate] = await tx
      .insert(estimates)
      .values({
        number,
        date: data.date,
        expiryDate: data.expiryDate || null,
        contactId: data.contactId,
        reference: data.reference || null,
        notes: data.notes || null,
        terms: data.terms || null,
        status: "draft",
        subtotal: totals.subtotal,
        discountTotal: totals.discountTotal,
        taxTotal: totals.taxTotal,
        total: totals.total,
      })
      .returning();

    await tx
      .insert(estimateLines)
      .values(totals.lines.map((l) => ({ ...l, estimateId: estimate.id })));
    return estimate.id;
  });

  await logActivity({
    action: "created estimate",
    entityType: "estimate",
    entityId: id,
  });

  revalidatePath(PATH);
  redirect(`${PATH}/${id}`);
}

export async function updateEstimate(id: string, input: TransactionFormInput) {
  const parsed = transactionFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const data = parsed.data;

  await db.transaction(async (tx) => {
    const totals = await computeTotals(tx, data);
    await tx
      .update(estimates)
      .set({
        date: data.date,
        expiryDate: data.expiryDate || null,
        contactId: data.contactId,
        reference: data.reference || null,
        notes: data.notes || null,
        terms: data.terms || null,
        subtotal: totals.subtotal,
        discountTotal: totals.discountTotal,
        taxTotal: totals.taxTotal,
        total: totals.total,
        updatedAt: new Date(),
      })
      .where(eq(estimates.id, id));

    await tx.delete(estimateLines).where(eq(estimateLines.estimateId, id));
    await tx
      .insert(estimateLines)
      .values(totals.lines.map((l) => ({ ...l, estimateId: id })));
  });

  await logActivity({
    action: "updated estimate",
    entityType: "estimate",
    entityId: id,
  });

  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
  redirect(`${PATH}/${id}`);
}

export async function setEstimateStatus(
  id: string,
  status: "draft" | "sent" | "viewed" | "accepted" | "declined" | "expired",
) {
  await db.update(estimates).set({ status, updatedAt: new Date() }).where(eq(estimates.id, id));
  await logActivity({
    action: `marked estimate as ${status}`,
    entityType: "estimate",
    entityId: id,
  });
  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
}

export async function deleteEstimate(id: string) {
  await db.delete(estimates).where(eq(estimates.id, id));
  await logActivity({
    action: "deleted estimate",
    entityType: "estimate",
    entityId: id,
  });
  revalidatePath(PATH);
  redirect(PATH);
}

export async function deleteEstimates(ids: string[]) {
  if (!ids.length) return;
  await db.delete(estimates).where(inArray(estimates.id, ids));
  revalidatePath(PATH);
}

// Convert an estimate into a sales order (marks the estimate accepted)
export async function createSalesOrderFromEstimate(estimateId: string) {
  const [estimate] = await db
    .select()
    .from(estimates)
    .where(eq(estimates.id, estimateId));
  if (!estimate) throw new Error("Estimate not found");

  const lines = await db
    .select()
    .from(estimateLines)
    .where(eq(estimateLines.estimateId, estimateId));

  const soId = await db.transaction(async (tx) => {
    const number = await nextNumber(tx, "sales_orders");
    const [so] = await tx
      .insert(salesOrders)
      .values({
        number,
        date: estimate.date,
        contactId: estimate.contactId,
        reference: estimate.number,
        notes: estimate.notes,
        terms: estimate.terms,
        status: "confirmed",
        subtotal: estimate.subtotal,
        discountTotal: estimate.discountTotal,
        taxTotal: estimate.taxTotal,
        total: estimate.total,
      })
      .returning();

    await tx.insert(salesOrderLines).values(
      lines.map((l) => ({
        salesOrderId: so.id,
        itemId: l.itemId,
        name: l.name,
        description: l.description,
        quantity: l.quantity,
        rate: l.rate,
        discountPercent: l.discountPercent,
        taxId: l.taxId,
        amount: l.amount,
      })),
    );

    await tx
      .update(estimates)
      .set({ status: "accepted", updatedAt: new Date() })
      .where(eq(estimates.id, estimateId));
    return so.id;
  });

  await logActivity({
    action: `converted estimate ${estimate.number} to sales order`,
    entityType: "sales_order",
    entityId: soId,
  });

  revalidatePath("/office/sales/estimates");
  redirect("/office/sales/sales-orders");
}

// Convert an estimate directly into an invoice
export async function createInvoiceFromEstimate(estimateId: string) {
  const [estimate] = await db
    .select()
    .from(estimates)
    .where(eq(estimates.id, estimateId));
  if (!estimate) throw new Error("Estimate not found");

  const lines = await db
    .select()
    .from(estimateLines)
    .where(eq(estimateLines.estimateId, estimateId));

  const invId = await db.transaction(async (tx) => {
    const number = await nextNumber(tx, "invoices");
    const [invoice] = await tx
      .insert(invoices)
      .values({
        number,
        date: estimate.date,
        contactId: estimate.contactId,
        reference: estimate.number,
        notes: estimate.notes,
        terms: estimate.terms,
        status: "draft",
        subtotal: estimate.subtotal,
        discountTotal: estimate.discountTotal,
        taxTotal: estimate.taxTotal,
        total: estimate.total,
      })
      .returning();

    await tx.insert(invoiceLines).values(
      lines.map((l) => ({
        invoiceId: invoice.id,
        itemId: l.itemId,
        name: l.name,
        description: l.description,
        quantity: l.quantity,
        rate: l.rate,
        discountPercent: l.discountPercent,
        taxId: l.taxId,
        amount: l.amount,
      })),
    );

    await tx
      .update(estimates)
      .set({ status: "accepted", updatedAt: new Date() })
      .where(eq(estimates.id, estimateId));
    return invoice.id;
  });

  await logActivity({
    action: `converted estimate ${estimate.number} to invoice`,
    entityType: "invoice",
    entityId: invId,
  });

  revalidatePath("/office/sales/estimates");
  redirect("/office/sales/invoices");
}
