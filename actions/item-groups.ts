"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { api } from "@/lib/api-client";
import {
  itemGroupFormSchema,
  type ItemGroupFormInput,
} from "@/lib/schemas/item-groups";

const PATH = "/office/inventory/itemgroups";

// Thin proxies to the Go backend; signatures match the original actions.

export async function createItemGroup(input: ItemGroupFormInput) {
  const parsed = itemGroupFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const { id } = await api.post<{ id: string }>("/item-groups", parsed.data);
  revalidatePath(PATH);
  redirect(`${PATH}/${id}`);
}

export async function updateItemGroup(id: string, input: ItemGroupFormInput) {
  const parsed = itemGroupFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  await api.patch(`/item-groups/${id}`, parsed.data);
  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
  redirect(`${PATH}/${id}`);
}

export async function deleteItemGroup(id: string) {
  await api.delete(`/item-groups/${id}`);
  revalidatePath(PATH);
  redirect(PATH);
}

export async function toggleItemGroupStatus(id: string, status: "active" | "inactive") {
  await api.patch(`/item-groups/${id}/status`, { status });
  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
}

export async function setItemGroupsStatus(ids: string[], status: "active" | "inactive") {
  if (!ids.length) return;
  await api.post("/item-groups/bulk-status", { ids, status });
  revalidatePath(PATH);
}

export async function deleteItemGroups(ids: string[]) {
  if (!ids.length) return;
  await api.post("/item-groups/bulk-delete", { ids });
  revalidatePath(PATH);
}
