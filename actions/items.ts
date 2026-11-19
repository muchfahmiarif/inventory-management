"use server";

import { inArray, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import { items, stockMovements } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { nextNumber } from "@/lib/numbering";
import { itemFormSchema, type ItemFormInput } from "@/lib/schemas/items";

const ITEMS_PATH = "/office/inventory/items";

function nullableRef(value?: string) {
  return value && value.length > 0 ? value : null;
}

function toDbValues(data: z.output<typeof itemFormSchema>) {
  return {
    name: data.name,
    type: data.type,
    sku: nullableRef(data.sku),
    unitId: nullableRef(data.unitId),
    brandId: nullableRef(data.brandId),
    categoryId: nullableRef(data.categoryId),
    groupId: nullableRef(data.groupId),
    taxId: nullableRef(data.taxId),
    preferredVendorId: nullableRef(data.preferredVendorId),
    description: nullableRef(data.description),
    costPrice: data.costPrice ?? null,
    sellingPrice: data.sellingPrice ?? null,
    wholesalePrice: data.wholesalePrice ?? null,
    reorderLevel: data.reorderLevel ?? null,
    updatedAt: new Date(),
  };
}

export async function createItem(input: ItemFormInput) {
  const parsed = itemFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const data = parsed.data;

  const id = await db.transaction(async (tx) => {
    // Zoho auto-generates the code when left blank
    const values = toDbValues(data);
    const sku = values.sku ?? (await nextNumber(tx, "items"));

    const [item] = await tx
      .insert(items)
      .values({ ...values, sku })
      .returning();

    const openingStock = data.openingStock ?? 0;
    if (
      data.type === "inventory" &&
      openingStock > 0 &&
      data.openingStockWarehouseId
    ) {
      await tx.insert(stockMovements).values({
        itemId: item.id,
        warehouseId: data.openingStockWarehouseId,
        quantity: openingStock,
        sourceType: "opening",
      });
    }
    return item.id;
  });

  await logActivity({
    action: "created item",
    entityType: "item",
    entityId: id,
    entityLabel: data.name,
  });

  revalidatePath(ITEMS_PATH);
  redirect(`${ITEMS_PATH}/${id}`);
}

export async function updateItem(id: string, input: ItemFormInput) {
  const parsed = itemFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const data = parsed.data;

  await db.update(items).set(toDbValues(data)).where(eq(items.id, id));

  await logActivity({
    action: "updated item",
    entityType: "item",
    entityId: id,
    entityLabel: data.name,
  });

  revalidatePath(ITEMS_PATH);
  revalidatePath(`${ITEMS_PATH}/${id}`);
  redirect(`${ITEMS_PATH}/${id}`);
}

export async function deleteItem(id: string) {
  await db.delete(items).where(eq(items.id, id));
  await logActivity({
    action: "deleted item",
    entityType: "item",
    entityId: id,
  });
  revalidatePath(ITEMS_PATH);
  redirect(ITEMS_PATH);
}

export async function toggleItemStatus(id: string, status: "active" | "inactive") {
  await db.update(items).set({ status, updatedAt: new Date() }).where(eq(items.id, id));
  await logActivity({
    action: `marked item as ${status}`,
    entityType: "item",
    entityId: id,
  });
  revalidatePath(ITEMS_PATH);
  revalidatePath(`${ITEMS_PATH}/${id}`);
}

export async function setItemsStatus(ids: string[], status: "active" | "inactive") {
  if (!ids.length) return;
  await db.update(items).set({ status, updatedAt: new Date() }).where(inArray(items.id, ids));
  revalidatePath(ITEMS_PATH);
}

export async function deleteItems(ids: string[]) {
  if (!ids.length) return;
  await db.delete(items).where(inArray(items.id, ids));
  await logActivity({
    action: `deleted ${ids.length} item(s)`,
    entityType: "item",
  });
  revalidatePath(ITEMS_PATH);
}
