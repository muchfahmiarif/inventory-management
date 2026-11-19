"use server";

import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import { warehouses } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import {
  warehouseFormSchema,
  type WarehouseFormInput,
} from "@/lib/schemas/warehouses";

const PATH = "/office/warehouse";

function toValues(data: z.output<typeof warehouseFormSchema>) {
  return {
    name: data.name,
    code: data.code || null,
    addressLine1: data.addressLine1 || null,
    city: data.city || null,
    state: data.state || null,
    zip: data.zip || null,
    country: data.country || null,
    contactName: data.contactName || null,
    phone: data.phone || null,
    email: data.email || null,
    isDefault: data.isDefault ?? false,
    updatedAt: new Date(),
  };
}

export async function createWarehouse(input: WarehouseFormInput) {
  const parsed = warehouseFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const data = parsed.data;

  const id = await db.transaction(async (tx) => {
    // Only one default warehouse
    if (data.isDefault) {
      await tx.update(warehouses).set({ isDefault: false });
    }
    const [warehouse] = await tx.insert(warehouses).values(toValues(data)).returning();
    return warehouse.id;
  });

  await logActivity({
    action: "created warehouse",
    entityType: "warehouse",
    entityId: id,
    entityLabel: data.name,
  });

  revalidatePath(PATH);
  redirect(`${PATH}/${id}`);
}

export async function updateWarehouse(id: string, input: WarehouseFormInput) {
  const parsed = warehouseFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const data = parsed.data;

  await db.transaction(async (tx) => {
    if (data.isDefault) {
      await tx.update(warehouses).set({ isDefault: false });
    }
    await tx.update(warehouses).set(toValues(data)).where(eq(warehouses.id, id));
  });

  await logActivity({
    action: "updated warehouse",
    entityType: "warehouse",
    entityId: id,
    entityLabel: data.name,
  });

  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
  redirect(`${PATH}/${id}`);
}

export async function deleteWarehouse(id: string) {
  await db.delete(warehouses).where(eq(warehouses.id, id));
  await logActivity({
    action: "deleted warehouse",
    entityType: "warehouse",
    entityId: id,
  });
  revalidatePath(PATH);
  redirect(PATH);
}

export async function deleteWarehouses(ids: string[]) {
  if (!ids.length) return;
  await db.delete(warehouses).where(inArray(warehouses.id, ids));
  revalidatePath(PATH);
}
