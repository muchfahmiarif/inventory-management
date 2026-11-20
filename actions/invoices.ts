"use server";

import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import { customerPayments, invoiceLines, invoices, items, taxes } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { nextNumber } from "@/lib/numbering";
import {
  transactionFormSchema,
  type TransactionFormInput,
} from "@/lib/schemas/transactions";

const PATH = "/office/sales/invoices";

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

export async function createInvoice(input: TransactionFormInput) {
  const parsed = transactionFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const data = parsed.data;
  const clean = {
    ...data,
    lines: data.lines.map((l) => ({
      ...l,
      taxId: l.taxId && l.taxId !== "none" ? l.taxId : undefined,
    })),
  };

  const id = await db.transaction(async (tx) => {
    const number = await nextNumber(tx, "invoices");
    const totals = await computeTotals(tx, clean);

    const [invoice] = await tx
      .insert(invoices)
      .values({
        number,
        date: clean.date,
        dueDate: clean.expiryDate || null,
        contactId: clean.contactId,
        reference: clean.reference || null,
        notes: clean.notes || null,
        terms: clean.terms || null,
        status: "draft",
        subtotal: totals.subtotal,
        discountTotal: totals.discountTotal,
        taxTotal: totals.taxTotal,
        total: totals.total,
      })
      .returning();

    await tx
      .insert(invoiceLines)
      .values(totals.lines.map((l) => ({ ...l, invoiceId: invoice.id })));
    return invoice.id;
  });

  await logActivity({
    action: "created invoice",
    entityType: "invoice",
    entityId: id,
  });

  revalidatePath(PATH);
  redirect(`${PATH}/${id}`);
}

export async function updateInvoice(id: string, input: TransactionFormInput) {
  const parsed = transactionFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const data = parsed.data;
  const clean = {
    ...data,
    lines: data.lines.map((l) => ({
      ...l,
      taxId: l.taxId && l.taxId !== "none" ? l.taxId : undefined,
    })),
  };

  await db.transaction(async (tx) => {
    const totals = await computeTotals(tx, clean);
    await tx
      .update(invoices)
      .set({
        date: clean.date,
        dueDate: clean.expiryDate || null,
        contactId: clean.contactId,
        reference: clean.reference || null,
        notes: clean.notes || null,
        terms: clean.terms || null,
        subtotal: totals.subtotal,
        discountTotal: totals.discountTotal,
        taxTotal: totals.taxTotal,
        total: totals.total,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, id));

    await tx.delete(invoiceLines).where(eq(invoiceLines.invoiceId, id));
    await tx
      .insert(invoiceLines)
      .values(totals.lines.map((l) => ({ ...l, invoiceId: id })));
  });

  await logActivity({
    action: "updated invoice",
    entityType: "invoice",
    entityId: id,
  });

  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
  redirect(`${PATH}/${id}`);
}

export async function setInvoiceStatus(id: string, status: "draft" | "sent" | "void") {
  await db.update(invoices).set({ status, updatedAt: new Date() }).where(eq(invoices.id, id));
  await logActivity({
    action: `marked invoice as ${status}`,
    entityType: "invoice",
    entityId: id,
  });
  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
}

export async function recordPayment(
  invoiceId: string,
  input: { amount: number; mode?: string; date: string; reference?: string },
) {
  await db.transaction(async (tx) => {
    const [invoice] = await tx.select().from(invoices).where(eq(invoices.id, invoiceId));
    if (!invoice) return;

    const number = await nextNumber(tx, "customer_payments");
    await tx.insert(customerPayments).values({
      number,
      date: input.date,
      contactId: invoice.contactId,
      invoiceId,
      amount: input.amount,
      mode: input.mode || null,
      reference: input.reference || null,
    });

    const paid = Number(invoice.amountPaid) + input.amount;
    const total = Number(invoice.total);
    const status =
      paid >= total ? "paid" : paid > 0 ? "partially_paid" : invoice.status;
    await tx
      .update(invoices)
      .set({ amountPaid: paid, status, updatedAt: new Date() })
      .where(eq(invoices.id, invoiceId));
  });

  await logActivity({
    action: "recorded payment",
    entityType: "invoice",
    entityId: invoiceId,
    metadata: { amount: input.amount },
  });

  revalidatePath(PATH);
  revalidatePath(`${PATH}/${invoiceId}`);
}

export async function deleteInvoice(id: string) {
  await db.delete(invoices).where(eq(invoices.id, id));
  await logActivity({
    action: "deleted invoice",
    entityType: "invoice",
    entityId: id,
  });
  revalidatePath(PATH);
  redirect(PATH);
}
