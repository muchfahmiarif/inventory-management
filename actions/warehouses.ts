"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { api } from "@/lib/api-client";
import {
  warehouseFormSchema,
  type WarehouseFormInput,
} from "@/lib/schemas/warehouses";

const PATH = "/office/warehouse";

// Thin proxies to the Go backend; signatures match the original actions.

export async function createWarehouse(input: WarehouseFormInput) {
  const parsed = warehouseFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const { id } = await api.post<{ id: string }>("/warehouses", parsed.data);
  revalidatePath(PATH);
  redirect(`${PATH}/${id}`);
}

export async function updateWarehouse(id: string, input: WarehouseFormInput) {
  const parsed = warehouseFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  await api.patch(`/warehouses/${id}`, parsed.data);
  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
  redirect(`${PATH}/${id}`);
}

export async function deleteWarehouse(id: string) {
  await api.delete(`/warehouses/${id}`);
  revalidatePath(PATH);
  redirect(PATH);
}

export async function deleteWarehouses(ids: string[]) {
  if (!ids.length) return;
  await api.post("/warehouses/bulk-delete", { ids });
  revalidatePath(PATH);
}
