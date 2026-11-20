"use server";

import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import { salesReturnLines, salesReturns, stockMovements } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { nextNumber } from "@/lib/numbering";
import {
  salesReturnFormSchema,
  type SalesReturnFormInput,
} from "@/lib/schemas/sales-returns";

const PATH = "/office/sales/sales-returns";

export async function createSalesReturn(input: SalesReturnFormInput) {
  const parsed = salesReturnFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const data = parsed.data;

  const id = await db.transaction(async (tx) => {
    const number = await nextNumber(tx, "sales_returns");
    let subtotal = 0;
    const lines = data.lines.map((l) => {
      const amount = Math.round(l.quantity * l.rate * 100) / 100;
      subtotal += amount;
      return { ...l, amount };
    });

    const [ret] = await tx
      .insert(salesReturns)
      .values({
        number,
        date: data.date,
        contactId: data.contactId,
        warehouseId: data.warehouseId,
        reference: data.reference || null,
        notes: data.notes || null,
        status: "draft",
        subtotal,
        discountTotal: 0,
        taxTotal: 0,
        total: Math.round(subtotal * 100) / 100,
      })
      .returning();

    await tx.insert(salesReturnLines).values(
      lines.map((l) => ({
        salesReturnId: ret.id,
        itemId: l.itemId,
        quantity: l.quantity,
        rate: l.rate,
        amount: l.amount,
      })),
    );
    return ret.id;
  });

  await logActivity({
    action: "created sales return",
    entityType: "sales_return",
    entityId: id,
  });

  revalidatePath(PATH);
  redirect(`${PATH}/${id}`);
}

export async function markSalesReturnReceived(id: string) {
  const [ret] = await db.select().from(salesReturns).where(eq(salesReturns.id, id));
  if (!ret || ret.status !== "draft") return;

  const lines = await db
    .select()
    .from(salesReturnLines)
    .where(eq(salesReturnLines.salesReturnId, id));

  await db.transaction(async (tx) => {
    // Received goods go back into stock
    for (const line of lines) {
      await tx.insert(stockMovements).values({
        itemId: line.itemId,
        warehouseId: ret.warehouseId,
        quantity: line.quantity,
        sourceType: "sales_return",
        sourceId: ret.id,
        sourceNumber: ret.number,
      });
    }
    await tx
      .update(salesReturns)
      .set({ status: "received", updatedAt: new Date() })
      .where(eq(salesReturns.id, id));
  });

  await logActivity({
    action: "marked sales return as received (stock returned)",
    entityType: "sales_return",
    entityId: id,
    entityLabel: ret.number,
  });

  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
}

export async function deleteSalesReturn(id: string) {
  const [ret] = await db.select().from(salesReturns).where(eq(salesReturns.id, id));
  if (ret?.status === "received") {
    // Reverse the stock-in
    const lines = await db
      .select()
      .from(salesReturnLines)
      .where(eq(salesReturnLines.salesReturnId, id));
    await db.transaction(async (tx) => {
      for (const line of lines) {
        await tx.insert(stockMovements).values({
          itemId: line.itemId,
          warehouseId: ret.warehouseId,
          quantity: -line.quantity,
          sourceType: "sales_return_reversal",
          sourceId: ret.id,
          sourceNumber: ret.number,
        });
      }
    });
  }
  await db.delete(salesReturns).where(eq(salesReturns.id, id));
  await logActivity({
    action: "deleted sales return",
    entityType: "sales_return",
    entityId: id,
  });
  revalidatePath(PATH);
  redirect(PATH);
}

export async function deleteSalesReturns(ids: string[]) {
  if (!ids.length) return;
  await db.delete(salesReturns).where(inArray(salesReturns.id, ids));
  revalidatePath(PATH);
}
