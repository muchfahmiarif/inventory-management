"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { api } from "@/lib/api-client";
import {
  adjustmentFormSchema,
  type AdjustmentFormInput,
} from "@/lib/schemas/adjustments";

const PATH = "/office/inventory/adjustments";

// Thin proxies to the Go backend (ledger postings happen server-side in Go).

export async function createAdjustment(input: AdjustmentFormInput) {
  const parsed = adjustmentFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const { id } = await api.post<{ id: string }>("/adjustments", parsed.data);
  revalidatePath(PATH);
  redirect(`${PATH}/${id}`);
}

export async function deleteAdjustment(id: string) {
  // Go reverses the ledger entries inside the transaction before deleting.
  await api.delete(`/adjustments/${id}`);
  revalidatePath(PATH);
  redirect(PATH);
}

export async function deleteAdjustments(ids: string[]) {
  if (!ids.length) return;
  await api.post("/adjustments/bulk-delete", { ids });
  // NOTE: bulk delete skips ledger reversal — use single delete for corrections
  revalidatePath(PATH);
}
