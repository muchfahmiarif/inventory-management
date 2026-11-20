"use server";

import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import { creditNoteLines, creditNotes, items, taxes } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { nextNumber } from "@/lib/numbering";
import {
  transactionFormSchema,
  type TransactionFormInput,
} from "@/lib/schemas/transactions";

const PATH = "/office/sales/credit-notes";

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

export async function createCreditNote(input: TransactionFormInput) {
  const parsed = transactionFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const data = cleanInput(parsed.data);

  const id = await db.transaction(async (tx) => {
    const number = await nextNumber(tx, "credit_notes");
    const totals = await computeTotals(tx, data);

    const [note] = await tx
      .insert(creditNotes)
      .values({
        number,
        date: data.date,
        contactId: data.contactId,
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
      .insert(creditNoteLines)
      .values(totals.lines.map((l) => ({ ...l, creditNoteId: note.id })));
    return note.id;
  });

  await logActivity({
    action: "created credit note",
    entityType: "credit_note",
    entityId: id,
  });

  revalidatePath(PATH);
  redirect(`${PATH}/${id}`);
}

export async function setCreditNoteStatus(id: string, status: "open" | "closed" | "void") {
  await db
    .update(creditNotes)
    .set({ status, updatedAt: new Date() })
    .where(eq(creditNotes.id, id));
  await logActivity({
    action: `marked credit note as ${status}`,
    entityType: "credit_note",
    entityId: id,
  });
  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
}

export async function deleteCreditNote(id: string) {
  await db.delete(creditNotes).where(eq(creditNotes.id, id));
  await logActivity({
    action: "deleted credit note",
    entityType: "credit_note",
    entityId: id,
  });
  revalidatePath(PATH);
  redirect(PATH);
}

export async function deleteCreditNotes(ids: string[]) {
  if (!ids.length) return;
  await db.delete(creditNotes).where(inArray(creditNotes.id, ids));
  revalidatePath(PATH);
}
