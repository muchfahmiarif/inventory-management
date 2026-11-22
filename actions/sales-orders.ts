"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { api } from "@/lib/api-client";
import {
  transactionFormSchema,
  type TransactionFormInput,
} from "@/lib/schemas/transactions";

const PATH = "/office/sales/sales-orders";

// Thin proxies to the Go backend.

export async function createSalesOrder(input: TransactionFormInput) {
  const parsed = transactionFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const { id } = await api.post<{ id: string }>("/sales-orders", parsed.data);
  revalidatePath(PATH);
  redirect(`${PATH}/${id}`);
}

export async function updateSalesOrder(id: string, input: TransactionFormInput) {
  const parsed = transactionFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  await api.patch(`/sales-orders/${id}`, parsed.data);
  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
  redirect(`${PATH}/${id}`);
}

export async function setSalesOrderStatus(
  id: string,
  status: "draft" | "confirmed" | "packed" | "shipped" | "invoiced" | "fulfilled" | "cancelled",
) {
  await api.patch(`/sales-orders/${id}/status`, { status });
  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
}

export async function deleteSalesOrder(id: string) {
  await api.delete(`/sales-orders/${id}`);
  revalidatePath(PATH);
  redirect(PATH);
}

export async function deleteSalesOrders(ids: string[]) {
  if (!ids.length) return;
  await api.post("/sales-orders/bulk-delete", { ids });
  revalidatePath(PATH);
}
