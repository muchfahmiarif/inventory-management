"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { api } from "@/lib/api-client";
import {
  compositeFormSchema,
  type CompositeFormInput,
} from "@/lib/schemas/composite-items";

const PATH = "/office/inventory/composite-items";

// Thin proxies to the Go backend; signatures match the original actions.

export async function createCompositeItem(input: CompositeFormInput) {
  const parsed = compositeFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const { id } = await api.post<{ id: string }>("/composite-items", parsed.data);
  revalidatePath(PATH);
  redirect(`${PATH}/${id}`);
}

export async function updateCompositeItem(id: string, input: CompositeFormInput) {
  const parsed = compositeFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  await api.patch(`/composite-items/${id}`, parsed.data);
  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
  redirect(`${PATH}/${id}`);
}

export async function deleteCompositeItem(id: string) {
  await api.delete(`/composite-items/${id}`);
  revalidatePath(PATH);
  redirect(PATH);
}
