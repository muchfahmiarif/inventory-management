"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { api } from "@/lib/api-client";
import {
  stockCountFormSchema,
  type StockCountFormInput,
} from "@/lib/schemas/stock-counts";

const PATH = "/office/stock-counts";

// Thin proxies to the Go backend (completion generates the adjustment there).

export async function createStockCount(input: StockCountFormInput) {
  const parsed = stockCountFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const { id } = await api.post<{ id: string }>("/stock-counts", parsed.data);
  revalidatePath(PATH);
  redirect(`${PATH}/${id}`);
}

export async function completeStockCount(id: string) {
  // Go generates an approved adjustment (ledger posted) and returns its id.
  const { adjustmentId } = await api.post<{ adjustmentId: string }>(
    `/stock-counts/${id}/complete`,
  );
  revalidatePath(PATH);
  revalidatePath("/office/inventory/adjustments");
  redirect(`/office/inventory/adjustments/${adjustmentId}`);
}

export async function deleteStockCount(id: string) {
  await api.delete(`/stock-counts/${id}`);
  revalidatePath(PATH);
  redirect(PATH);
}

export async function deleteStockCounts(ids: string[]) {
  if (!ids.length) return;
  await api.post("/stock-counts/bulk-delete", { ids });
  revalidatePath(PATH);
}
