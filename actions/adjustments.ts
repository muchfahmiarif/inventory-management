"use server";

import { inArray, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import { inventoryAdjustmentLines, inventoryAdjustments, stockMovements } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { nextNumber } from "@/lib/numbering";
import {
  adjustmentFormSchema,
  type AdjustmentFormInput,
} from "@/lib/schemas/adjustments";
import { getStockForItemWarehouse } from "@/lib/stock";

const PATH = "/office/inventory/adjustments";

export async function createAdjustment(input: AdjustmentFormInput) {
  const parsed = adjustmentFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const data = parsed.data;

  const id = await db.transaction(async (tx) => {
    const number = await nextNumber(tx, "adjustments");
    const [adjustment] = await tx
      .insert(inventoryAdjustments)
      .values({
        number,
        date: data.date,
        reference: data.reference || null,
        reason: data.reason || null,
        warehouseId: data.warehouseId,
        status: "approved",
      })
      .returning();

    for (const line of data.lines) {
      const system =
        line.systemQuantity ??
        (await getStockForItemWarehouse(line.itemId, data.warehouseId));
      const diff = line.adjustedQuantity - system;
      await tx.insert(inventoryAdjustmentLines).values({
        adjustmentId: adjustment.id,
        itemId: line.itemId,
        systemQuantity: system,
        adjustedQuantity: line.adjustedQuantity,
      });
      if (diff !== 0) {
        await tx.insert(stockMovements).values({
          itemId: line.itemId,
          warehouseId: data.warehouseId,
          quantity: diff,
          sourceType: "adjustment",
          sourceId: adjustment.id,
          sourceNumber: number,
        });
      }
    }
    return adjustment.id;
  });

  await logActivity({
    action: "created inventory adjustment",
    entityType: "inventory_adjustment",
    entityId: id,
    entityLabel: data.reference || undefined,
  });

  revalidatePath(PATH);
  redirect(`${PATH}/${id}`);
}

export async function deleteAdjustment(id: string) {
  // Reverse the ledger entries, then remove the adjustment
  await db.transaction(async (tx) => {
    const [adj] = await tx
      .select()
      .from(inventoryAdjustments)
      .where(eq(inventoryAdjustments.id, id));
    if (!adj) return;

    const lines = await tx
      .select()
      .from(inventoryAdjustmentLines)
      .where(inArray(inventoryAdjustmentLines.adjustmentId, [id]));
    for (const line of lines) {
      const diff = line.adjustedQuantity - line.systemQuantity;
      if (diff !== 0) {
        await tx.insert(stockMovements).values({
          itemId: line.itemId,
          warehouseId: adj.warehouseId,
          quantity: -diff,
          sourceType: "adjustment_reversal",
          sourceId: adj.id,
          sourceNumber: adj.number,
        });
      }
    }
    await tx
      .delete(inventoryAdjustments)
      .where(eq(inventoryAdjustments.id, id));
  });

  await logActivity({
    action: "deleted inventory adjustment (stock reversed)",
    entityType: "inventory_adjustment",
    entityId: id,
  });

  revalidatePath(PATH);
  redirect(PATH);
}

export async function deleteAdjustments(ids: string[]) {
  if (!ids.length) return;
  await db.delete(inventoryAdjustments).where(inArray(inventoryAdjustments.id, ids));
  // NOTE: bulk delete skips ledger reversal — use single delete for corrections
  revalidatePath(PATH);
}
