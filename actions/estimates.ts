"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { api } from "@/lib/api-client";
import {
  transactionFormSchema,
  type TransactionFormInput,
} from "@/lib/schemas/transactions";

const PATH = "/office/sales/estimates";

// Thin proxies to the Go backend (totals recomputed server-side there).

export async function createEstimate(input: TransactionFormInput) {
  const parsed = transactionFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const { id } = await api.post<{ id: string }>("/estimates", parsed.data);
  revalidatePath(PATH);
  redirect(`${PATH}/${id}`);
}

export async function updateEstimate(id: string, input: TransactionFormInput) {
  const parsed = transactionFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  await api.patch(`/estimates/${id}`, parsed.data);
  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
  redirect(`${PATH}/${id}`);
}

export async function setEstimateStatus(
  id: string,
  status: "draft" | "sent" | "viewed" | "accepted" | "declined" | "expired",
) {
  await api.patch(`/estimates/${id}/status`, { status });
  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
}

export async function deleteEstimate(id: string) {
  await api.delete(`/estimates/${id}`);
  revalidatePath(PATH);
  redirect(PATH);
}

export async function deleteEstimates(ids: string[]) {
  if (!ids.length) return;
  await api.post("/estimates/bulk-delete", { ids });
  revalidatePath(PATH);
}

// Convert an estimate into a sales order (Go marks the estimate accepted)
export async function createSalesOrderFromEstimate(estimateId: string) {
  await api.post(`/estimates/${estimateId}/convert/sales-order`);
  revalidatePath("/office/sales/estimates");
  redirect("/office/sales/sales-orders");
}

// Convert an estimate directly into an invoice
export async function createInvoiceFromEstimate(estimateId: string) {
  await api.post(`/estimates/${estimateId}/convert/invoice`);
  revalidatePath("/office/sales/estimates");
  redirect("/office/sales/invoices");
}
