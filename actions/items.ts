"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { api } from "@/lib/api-client";
import { itemFormSchema, type ItemFormInput } from "@/lib/schemas/items";

const ITEMS_PATH = "/office/inventory/items";

// Thin proxies to the Go backend (inventory-backend). Numbering, opening
// stock, and activity logging now happen server-side in Go; this file keeps
// the same exported signatures so every call site stays unchanged.

export async function createItem(input: ItemFormInput) {
  const parsed = itemFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const { id } = await api.post<{ id: string }>("/items", parsed.data);
  revalidatePath(ITEMS_PATH);
  redirect(`${ITEMS_PATH}/${id}`);
}

export async function updateItem(id: string, input: ItemFormInput) {
  const parsed = itemFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  await api.patch(`/items/${id}`, parsed.data);
  revalidatePath(ITEMS_PATH);
  revalidatePath(`${ITEMS_PATH}/${id}`);
  redirect(`${ITEMS_PATH}/${id}`);
}

export async function deleteItem(id: string) {
  await api.delete(`/items/${id}`);
  revalidatePath(ITEMS_PATH);
  redirect(ITEMS_PATH);
}

export async function toggleItemStatus(id: string, status: "active" | "inactive") {
  await api.patch(`/items/${id}/status`, { status });
  revalidatePath(ITEMS_PATH);
  revalidatePath(`${ITEMS_PATH}/${id}`);
}

export async function setItemsStatus(ids: string[], status: "active" | "inactive") {
  if (!ids.length) return;
  await api.post("/items/bulk-status", { ids, status });
  revalidatePath(ITEMS_PATH);
}

export async function deleteItems(ids: string[]) {
  if (!ids.length) return;
  await api.post("/items/bulk-delete", { ids });
  revalidatePath(ITEMS_PATH);
}
