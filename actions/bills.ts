"use server";

import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import {
  billLines,
  bills,
  items,
  taxes,
  vendorPayments,
} from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { nextNumber } from "@/lib/numbering";
import {
  transactionFormSchema,
  type TransactionFormInput,
} from "@/lib/schemas/transactions";

const PATH = "/office/purchases/bills";

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

export async function createBill(input: TransactionFormInput & { purchaseOrderId?: string }) {
  const parsed = transactionFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const data = cleanInput(parsed.data);

  const id = await db.transaction(async (tx) => {
    const number = await nextNumber(tx, "bills");
    const totals = await computeTotals(tx, data);

    const [bill] = await tx
      .insert(bills)
      .values({
        number,
        date: data.date,
        dueDate: data.expiryDate || null,
        contactId: data.contactId,
        purchaseOrderId: input.purchaseOrderId || null,
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
      .insert(billLines)
      .values(totals.lines.map((l) => ({ ...l, billId: bill.id })));
    return bill.id;
  });

  await logActivity({
    action: "created bill",
    entityType: "bill",
    entityId: id,
  });

  revalidatePath(PATH);
  redirect(`${PATH}/${id}`);
}

export async function updateBill(id: string, input: TransactionFormInput) {
  const parsed = transactionFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const data = cleanInput(parsed.data);

  await db.transaction(async (tx) => {
    const totals = await computeTotals(tx, data);
    await tx
      .update(bills)
      .set({
        date: data.date,
        dueDate: data.expiryDate || null,
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
      .where(eq(bills.id, id));

    await tx.delete(billLines).where(eq(billLines.billId, id));
    await tx.insert(billLines).values(totals.lines.map((l) => ({ ...l, billId: id })));
  });

  await logActivity({
    action: "updated bill",
    entityType: "bill",
    entityId: id,
  });

  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
  redirect(`${PATH}/${id}`);
}

export async function recordBillPayment(
  billId: string,
  input: { amount: number; mode?: string; date: string; reference?: string },
) {
  await db.transaction(async (tx) => {
    const [bill] = await tx.select().from(bills).where(eq(bills.id, billId));
    if (!bill) return;

    const number = await nextNumber(tx, "vendor_payments");
    await tx.insert(vendorPayments).values({
      number,
      date: input.date,
      contactId: bill.contactId,
      billId,
      amount: input.amount,
      mode: input.mode || null,
      reference: input.reference || null,
    });

    const paid = Number(bill.amountPaid) + input.amount;
    const total = Number(bill.total);
    const status = paid >= total ? "paid" : paid > 0 ? "partially_paid" : bill.status;
    await tx
      .update(bills)
      .set({ amountPaid: paid, status, updatedAt: new Date() })
      .where(eq(bills.id, billId));
  });

  await logActivity({
    action: "recorded vendor payment",
    entityType: "bill",
    entityId: billId,
    metadata: { amount: input.amount },
  });

  revalidatePath(PATH);
  revalidatePath(`${PATH}/${billId}`);
}

export async function deleteBill(id: string) {
  await db.delete(bills).where(eq(bills.id, id));
  await logActivity({
    action: "deleted bill",
    entityType: "bill",
    entityId: id,
  });
  revalidatePath(PATH);
  redirect(PATH);
}

export async function deleteBills(ids: string[]) {
  if (!ids.length) return;
  await db.delete(bills).where(inArray(bills.id, ids));
  revalidatePath(PATH);
}
