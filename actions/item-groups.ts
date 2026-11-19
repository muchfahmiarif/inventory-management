"use server";

import { asc, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import { itemGroupAttributes, itemGroups, items } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import {
  itemGroupFormSchema,
  type ItemGroupFormInput,
} from "@/lib/schemas/item-groups";

const PATH = "/office/inventory/itemgroups";

export async function createItemGroup(input: ItemGroupFormInput) {
  const parsed = itemGroupFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const data = parsed.data;

  const id = await db.transaction(async (tx) => {
    const [group] = await tx
      .insert(itemGroups)
      .values({
        name: data.name,
        description: data.description || null,
      })
      .returning();

    const attrs = (data.attributes ?? []).filter((a) => a.name.trim());
    if (attrs.length) {
      await tx.insert(itemGroupAttributes).values(
        attrs.map((a, i) => ({ groupId: group.id, name: a.name.trim(), sortOrder: String(i) })),
      );
    }
    return group.id;
  });

  await logActivity({
    action: "created item group",
    entityType: "item_group",
    entityId: id,
    entityLabel: data.name,
  });

  revalidatePath(PATH);
  redirect(`${PATH}/${id}`);
}

export async function updateItemGroup(id: string, input: ItemGroupFormInput) {
  const parsed = itemGroupFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const data = parsed.data;

  await db.transaction(async (tx) => {
    await tx
      .update(itemGroups)
      .set({ name: data.name, description: data.description || null, updatedAt: new Date() })
      .where(eq(itemGroups.id, id));

    await tx.delete(itemGroupAttributes).where(eq(itemGroupAttributes.groupId, id));
    const attrs = (data.attributes ?? []).filter((a) => a.name.trim());
    if (attrs.length) {
      await tx.insert(itemGroupAttributes).values(
        attrs.map((a, i) => ({ groupId: id, name: a.name.trim(), sortOrder: String(i) })),
      );
    }
  });

  await logActivity({
    action: "updated item group",
    entityType: "item_group",
    entityId: id,
    entityLabel: data.name,
  });

  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
  redirect(`${PATH}/${id}`);
}

export async function deleteItemGroup(id: string) {
  // Unassign items first so the group can be removed
  await db.update(items).set({ groupId: null }).where(eq(items.groupId, id));
  await db.delete(itemGroups).where(eq(itemGroups.id, id));
  await logActivity({
    action: "deleted item group",
    entityType: "item_group",
    entityId: id,
  });
  revalidatePath(PATH);
  redirect(PATH);
}

export async function toggleItemGroupStatus(id: string, status: "active" | "inactive") {
  await db
    .update(itemGroups)
    .set({ status, updatedAt: new Date() })
    .where(eq(itemGroups.id, id));
  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
}

export async function setItemGroupsStatus(ids: string[], status: "active" | "inactive") {
  if (!ids.length) return;
  await db
    .update(itemGroups)
    .set({ status, updatedAt: new Date() })
    .where(inArray(itemGroups.id, ids));
  revalidatePath(PATH);
}

export async function deleteItemGroups(ids: string[]) {
  if (!ids.length) return;
  await db.update(items).set({ groupId: null }).where(inArray(items.groupId, ids));
  await db.delete(itemGroups).where(inArray(itemGroups.id, ids));
  revalidatePath(PATH);
}

// Helper for detail pages: attributes of a group
export async function getItemGroupAttributes(groupId: string) {
  return db
    .select()
    .from(itemGroupAttributes)
    .where(eq(itemGroupAttributes.groupId, groupId))
    .orderBy(asc(itemGroupAttributes.sortOrder));
}

export async function countItemsInGroups() {
  return db
    .select({ groupId: items.groupId, count: sql<number>`count(*)::int` })
    .from(items)
    .groupBy(items.groupId);
}
