"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { api } from "@/lib/api-client";
import {
  transactionFormSchema,
  type TransactionFormInput,
} from "@/lib/schemas/transactions";

const PATH = "/office/purchases/purchase-orders";

// Thin proxies to the Go backend (Receive Items stock-in happens there).

export async function createPurchaseOrder(
  input: TransactionFormInput & { warehouseId?: string },
) {
  const parsed = transactionFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const { id } = await api.post<{ id: string }>("/purchase-orders", parsed.data);
  revalidatePath(PATH);
  redirect(`${PATH}/${id}`);
}

export async function updatePurchaseOrder(
  id: string,
  input: TransactionFormInput & { warehouseId?: string },
) {
  const parsed = transactionFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  await api.patch(`/purchase-orders/${id}`, parsed.data);
  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
  redirect(`${PATH}/${id}`);
}

export async function receivePurchaseOrderItems(
  id: string,
  quantities?: Record<string, number>,
) {
  await api.post(`/purchase-orders/${id}/receive`, quantities ? { quantities } : undefined);
  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
}

export async function setPurchaseOrderStatus(
  id: string,
  status: "draft" | "open" | "partially_received" | "received" | "billed" | "cancelled",
) {
  await api.patch(`/purchase-orders/${id}/status`, { status });
  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
}

export async function deletePurchaseOrder(id: string) {
  await api.delete(`/purchase-orders/${id}`);
  revalidatePath(PATH);
  redirect(PATH);
}

export async function deletePurchaseOrders(ids: string[]) {
  if (!ids.length) return;
  await api.post("/purchase-orders/bulk-delete", { ids });
  revalidatePath(PATH);
}
