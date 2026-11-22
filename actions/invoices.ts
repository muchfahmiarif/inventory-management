"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { api } from "@/lib/api-client";
import {
  transactionFormSchema,
  type TransactionFormInput,
} from "@/lib/schemas/transactions";

const PATH = "/office/sales/invoices";

// Thin proxies to the Go backend (payment application happens there).

export async function createInvoice(input: TransactionFormInput) {
  const parsed = transactionFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const { id } = await api.post<{ id: string }>("/invoices", parsed.data);
  revalidatePath(PATH);
  redirect(`${PATH}/${id}`);
}

export async function updateInvoice(id: string, input: TransactionFormInput) {
  const parsed = transactionFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  await api.patch(`/invoices/${id}`, parsed.data);
  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
  redirect(`${PATH}/${id}`);
}

export async function setInvoiceStatus(id: string, status: "draft" | "sent" | "void") {
  await api.patch(`/invoices/${id}/status`, { status });
  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
}

export async function recordPayment(
  invoiceId: string,
  input: { amount: number; mode?: string; date: string; reference?: string },
) {
  await api.post(`/invoices/${invoiceId}/payments`, input);
  revalidatePath(PATH);
  revalidatePath(`${PATH}/${invoiceId}`);
}

export async function deleteInvoice(id: string) {
  await api.delete(`/invoices/${id}`);
  revalidatePath(PATH);
  redirect(PATH);
}

// Convert a sales order into an invoice (Go marks the SO invoiced)
export async function createInvoiceFromSalesOrder(salesOrderId: string) {
  const { id } = await api.post<{ id: string }>("/invoices/convert-from-sales-order", {
    salesOrderId,
  });
  revalidatePath(PATH);
  redirect(`${PATH}/${id}`);
}
