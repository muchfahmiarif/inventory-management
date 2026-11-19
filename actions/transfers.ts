"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import { stockMovements, transferOrderLines, transferOrders } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { nextNumber } from "@/lib/numbering";
import {
  transferFormSchema,
  type TransferFormInput,
} from "@/lib/schemas/transfers";

const PATH = "/office/transfers";

export async function createTransfer(input: TransferFormInput) {
  const parsed = transferFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const data = parsed.data;
  if (data.fromWarehouseId === data.toWarehouseId) {
    return {
      ok: false as const,
      errors: { fromWarehouseId: ["Source and destination must differ"] },
    };
  }

  const id = await db.transaction(async (tx) => {
    const number = await nextNumber(tx, "transfers");
    const [transfer] = await tx
      .insert(transferOrders)
      .values({
        number,
        date: data.date,
        fromWarehouseId: data.fromWarehouseId,
        toWarehouseId: data.toWarehouseId,
        status: "draft",
        notes: data.notes || null,
      })
      .returning();

    await tx.insert(transferOrderLines).values(
      data.lines.map((l) => ({
        transferOrderId: transfer.id,
        itemId: l.itemId,
        quantity: l.quantity ?? 1,
      })),
    );
    return transfer.id;
  });

  await logActivity({
    action: "created transfer order",
    entityType: "transfer_order",
    entityId: id,
  });

  revalidatePath(PATH);
  redirect(`${PATH}/${id}`);
}

async function getTransferWithLines(id: string) {
  const [transfer] = await db
    .select()
    .from(transferOrders)
    .where(eq(transferOrders.id, id));
  if (!transfer) return null;
  const lines = await db
    .select()
    .from(transferOrderLines)
    .where(eq(transferOrderLines.transferOrderId, id));
  return { transfer, lines };
}

export async function markTransferShipped(id: string) {
  const result = await getTransferWithLines(id);
  if (!result || result.transfer.status !== "draft") return;

  await db.transaction(async (tx) => {
    // Stock leaves the source warehouse now
    for (const line of result.lines) {
      await tx.insert(stockMovements).values({
        itemId: line.itemId,
        warehouseId: result.transfer.fromWarehouseId,
        quantity: -line.quantity,
        sourceType: "transfer",
        sourceId: result.transfer.id,
        sourceNumber: result.transfer.number,
      });
    }
    await tx
      .update(transferOrders)
      .set({ status: "shipped", updatedAt: new Date() })
      .where(eq(transferOrders.id, id));
  });

  await logActivity({
    action: "marked transfer as shipped",
    entityType: "transfer_order",
    entityId: id,
    entityLabel: result.transfer.number,
  });

  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
}

export async function markTransferReceived(id: string) {
  const result = await getTransferWithLines(id);
  if (!result || result.transfer.status !== "shipped") return;

  await db.transaction(async (tx) => {
    for (const line of result.lines) {
      await tx.insert(stockMovements).values({
        itemId: line.itemId,
        warehouseId: result.transfer.toWarehouseId,
        quantity: line.quantity,
        sourceType: "transfer",
        sourceId: result.transfer.id,
        sourceNumber: result.transfer.number,
      });
    }
    await tx
      .update(transferOrders)
      .set({ status: "received", updatedAt: new Date() })
      .where(eq(transferOrders.id, id));
  });

  await logActivity({
    action: "marked transfer as received",
    entityType: "transfer_order",
    entityId: id,
    entityLabel: result.transfer.number,
  });

  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
}

export async function deleteTransfer(id: string) {
  const result = await getTransferWithLines(id);
  if (!result) return;

  // Reverse movements if already shipped
  await db.transaction(async (tx) => {
    if (result.transfer.status === "shipped") {
      for (const line of result.lines) {
        await tx.insert(stockMovements).values({
          itemId: line.itemId,
          warehouseId: result.transfer.fromWarehouseId,
          quantity: line.quantity, // give stock back to source
          sourceType: "transfer_reversal",
          sourceId: result.transfer.id,
          sourceNumber: result.transfer.number,
        });
      }
    }
    await tx.delete(transferOrders).where(eq(transferOrders.id, id));
  });

  await logActivity({
    action: "deleted transfer order",
    entityType: "transfer_order",
    entityId: id,
  });

  revalidatePath(PATH);
  redirect(PATH);
}

export async function deleteTransfers(ids: string[]) {
  if (!ids.length) return;
  const shipped = await db
    .select({ id: transferOrders.id })
    .from(transferOrders)
    .where(and(inArray(transferOrders.id, ids), eq(transferOrders.status, "shipped")));
  // Only drafts are bulk-deleted; shipped ones must be reversed individually
  const draftIds = ids.filter(
    (id) => !shipped.some((s) => s.id === id),
  );
  if (draftIds.length) {
    await db.delete(transferOrders).where(inArray(transferOrders.id, draftIds));
  }
  revalidatePath(PATH);
}
