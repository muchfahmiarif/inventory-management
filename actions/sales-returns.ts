"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { api } from "@/lib/api-client";
import {
  salesReturnFormSchema,
  type SalesReturnFormInput,
} from "@/lib/schemas/sales-returns";

const PATH = "/office/sales/sales-returns";

// Thin proxies to the Go backend (stock-in on receive happens there).

export async function createSalesReturn(input: SalesReturnFormInput) {
  const parsed = salesReturnFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const { id } = await api.post<{ id: string }>("/sales-returns", parsed.data);
  revalidatePath(PATH);
  redirect(`${PATH}/${id}`);
}

export async function markSalesReturnReceived(id: string) {
  await api.post(`/sales-returns/${id}/receive`);
  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
}

export async function deleteSalesReturn(id: string) {
  // Go reverses the stock-in if the return was received.
  await api.delete(`/sales-returns/${id}`);
  revalidatePath(PATH);
  redirect(PATH);
}

export async function deleteSalesReturns(ids: string[]) {
  if (!ids.length) return;
  await api.post("/sales-returns/bulk-delete", { ids });
  revalidatePath(PATH);
}
