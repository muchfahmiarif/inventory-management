"use server";

import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import {
  inventoryAdjustmentLines,
  inventoryAdjustments,
  stockCountLines,
  stockCounts,
  stockMovements,
} from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { nextNumber } from "@/lib/numbering";
import { getStockForItemWarehouse } from "@/lib/stock";

const PATH = "/office/stock-counts";

const optionalNumber = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number().optional(),
);

const stockCountFormSchema = z.object({
  date: z.string().min(1, "Date is required"),
  warehouseId: z.string().min(1, "Select a warehouse"),
  notes: z.string().optional(),
  lines: z
    .array(
      z.object({
        itemId: z.string().min(1, "Select an item"),
        countedQuantity: optionalNumber,
      }),
    )
    .min(1, "Add at least one item"),
});

export type StockCountFormInput = z.infer<typeof stockCountFormSchema>;

export async function createStockCount(input: StockCountFormInput) {
  const parsed = stockCountFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const data = parsed.data;

  const id = await db.transaction(async (tx) => {
    const number = await nextNumber(tx, "stock_counts");
    const [count] = await tx
      .insert(stockCounts)
      .values({
        number,
        date: data.date,
        warehouseId: data.warehouseId,
        status: "draft",
        notes: data.notes || null,
      })
      .returning();

    for (const line of data.lines) {
      const system = await getStockForItemWarehouse(line.itemId, data.warehouseId);
      await tx.insert(stockCountLines).values({
        stockCountId: count.id,
        itemId: line.itemId,
        systemQuantity: system,
        countedQuantity: line.countedQuantity ?? null,
      });
    }
    return count.id;
  });

  await logActivity({
    action: "created stock count",
    entityType: "stock_count",
    entityId: id,
  });

  revalidatePath(PATH);
  redirect(`${PATH}/${id}`);
}

// Completes the count: generates an approved adjustment for every line where
// counted != system, writing ledger entries. Redirects to the adjustment.
export async function completeStockCount(id: string) {
  const [count] = await db
    .select()
    .from(stockCounts)
    .where(eq(stockCounts.id, id));
  if (!count || count.status !== "draft") return;

  const lines = await db
    .select()
    .from(stockCountLines)
    .where(eq(stockCountLines.stockCountId, id));

  const adjustmentId = await db.transaction(async (tx) => {
    const adjustmentNumber = await nextNumber(tx, "adjustments");
    const [adjustment] = await tx
      .insert(inventoryAdjustments)
      .values({
        number: adjustmentNumber,
        date: count.date,
        reference: count.number,
        reason: `Stock count ${count.number}`,
        warehouseId: count.warehouseId,
        status: "approved",
      })
      .returning();

    for (const line of lines) {
      const counted = line.countedQuantity ?? line.systemQuantity;
      const diff = counted - line.systemQuantity;
      await tx.insert(inventoryAdjustmentLines).values({
        adjustmentId: adjustment.id,
        itemId: line.itemId,
        systemQuantity: line.systemQuantity,
        adjustedQuantity: counted,
      });
      if (diff !== 0) {
        await tx.insert(stockMovements).values({
          itemId: line.itemId,
          warehouseId: count.warehouseId,
          quantity: diff,
          sourceType: "adjustment",
          sourceId: adjustment.id,
          sourceNumber: adjustmentNumber,
        });
      }
    }

    await tx
      .update(stockCounts)
      .set({ status: "completed", updatedAt: new Date() })
      .where(eq(stockCounts.id, id));

    return adjustment.id;
  });

  await logActivity({
    action: "completed stock count",
    entityType: "stock_count",
    entityId: id,
  });

  revalidatePath(PATH);
  revalidatePath("/office/inventory/adjustments");
  redirect(`/office/inventory/adjustments/${adjustmentId}`);
}

export async function deleteStockCount(id: string) {
  await db.delete(stockCounts).where(eq(stockCounts.id, id));
  await logActivity({
    action: "deleted stock count",
    entityType: "stock_count",
    entityId: id,
  });
  revalidatePath(PATH);
  redirect(PATH);
}

export async function deleteStockCounts(ids: string[]) {
  if (!ids.length) return;
  await db.delete(stockCounts).where(inArray(stockCounts.id, ids));
  revalidatePath(PATH);
}
