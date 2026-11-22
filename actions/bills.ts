"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { api } from "@/lib/api-client";
import {
  transactionFormSchema,
  type TransactionFormInput,
} from "@/lib/schemas/transactions";

const PATH = "/office/purchases/bills";

// Thin proxies to the Go backend (vendor payment application happens there).

export async function createBill(
  input: TransactionFormInput & { purchaseOrderId?: string },
) {
  const parsed = transactionFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const { id } = await api.post<{ id: string }>("/bills", parsed.data);
  revalidatePath(PATH);
  redirect(`${PATH}/${id}`);
}

export async function updateBill(id: string, input: TransactionFormInput) {
  const parsed = transactionFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  await api.patch(`/bills/${id}`, parsed.data);
  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
  redirect(`${PATH}/${id}`);
}

export async function recordBillPayment(
  billId: string,
  input: { amount: number; mode?: string; date: string; reference?: string },
) {
  await api.post(`/bills/${billId}/payments`, input);
  revalidatePath(PATH);
  revalidatePath(`${PATH}/${billId}`);
}

export async function deleteBill(id: string) {
  await api.delete(`/bills/${id}`);
  revalidatePath(PATH);
  redirect(PATH);
}

export async function deleteBills(ids: string[]) {
  if (!ids.length) return;
  await api.post("/bills/bulk-delete", { ids });
  revalidatePath(PATH);
}
