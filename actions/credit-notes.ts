"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { api } from "@/lib/api-client";
import {
  transactionFormSchema,
  type TransactionFormInput,
} from "@/lib/schemas/transactions";

const PATH = "/office/sales/credit-notes";

// Thin proxies to the Go backend.

export async function createCreditNote(input: TransactionFormInput) {
  const parsed = transactionFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const { id } = await api.post<{ id: string }>("/credit-notes", parsed.data);
  revalidatePath(PATH);
  redirect(`${PATH}/${id}`);
}

export async function setCreditNoteStatus(id: string, status: "open" | "closed" | "void") {
  await api.patch(`/credit-notes/${id}/status`, { status });
  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
}

export async function deleteCreditNote(id: string) {
  await api.delete(`/credit-notes/${id}`);
  revalidatePath(PATH);
  redirect(PATH);
}

export async function deleteCreditNotes(ids: string[]) {
  if (!ids.length) return;
  await api.post("/credit-notes/bulk-delete", { ids });
  revalidatePath(PATH);
}
