"use server";

import { asc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import { compositeComponents, compositeItems, items } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { nextNumber } from "@/lib/numbering";
import {
  compositeFormSchema,
  type CompositeFormInput,
} from "@/lib/schemas/composite-items";

const PATH = "/office/inventory/composite-items";

function nullableRef(value?: string) {
  return value && value.length > 0 ? value : null;
}

export async function createCompositeItem(input: CompositeFormInput) {
  const parsed = compositeFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const data = parsed.data;

  const id = await db.transaction(async (tx) => {
    const sku = nullableRef(data.sku) ?? (await nextNumber(tx, "composite_items"));
    const [composite] = await tx
      .insert(compositeItems)
      .values({
        name: data.name,
        sku,
        unitId: nullableRef(data.unitId),
        brandId: nullableRef(data.brandId),
        categoryId: nullableRef(data.categoryId),
        description: nullableRef(data.description),
      })
      .returning();

    await tx.insert(compositeComponents).values(
      data.components.map((c) => ({
        compositeItemId: composite.id,
        itemId: c.itemId,
        quantity: c.quantity ?? 1,
      })),
    );
    return composite.id;
  });

  await logActivity({
    action: "created composite item",
    entityType: "composite_item",
    entityId: id,
    entityLabel: data.name,
  });

  revalidatePath(PATH);
  redirect(`${PATH}/${id}`);
}

export async function updateCompositeItem(id: string, input: CompositeFormInput) {
  const parsed = compositeFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const data = parsed.data;

  await db.transaction(async (tx) => {
    await tx
      .update(compositeItems)
      .set({
        name: data.name,
        sku: nullableRef(data.sku),
        unitId: nullableRef(data.unitId),
        brandId: nullableRef(data.brandId),
        categoryId: nullableRef(data.categoryId),
        description: nullableRef(data.description),
        updatedAt: new Date(),
      })
      .where(eq(compositeItems.id, id));

    await tx
      .delete(compositeComponents)
      .where(eq(compositeComponents.compositeItemId, id));
    await tx.insert(compositeComponents).values(
      data.components.map((c) => ({
        compositeItemId: id,
        itemId: c.itemId,
        quantity: c.quantity ?? 1,
      })),
    );
  });

  await logActivity({
    action: "updated composite item",
    entityType: "composite_item",
    entityId: id,
    entityLabel: data.name,
  });

  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
  redirect(`${PATH}/${id}`);
}

export async function deleteCompositeItem(id: string) {
  await db.delete(compositeItems).where(eq(compositeItems.id, id));
  await logActivity({
    action: "deleted composite item",
    entityType: "composite_item",
    entityId: id,
  });
  revalidatePath(PATH);
  redirect(PATH);
}

export async function getComponentCost(componentItemIds: string[]) {
  const rows = await db
    .select({ id: items.id, costPrice: items.costPrice })
    .from(items)
    .where(inArray(items.id, componentItemIds));
  return Object.fromEntries(rows.map((r) => [r.id, r.costPrice ?? 0]));
}
