"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { api } from "@/lib/api-client";
import {
  transactionFormSchema,
  type TransactionFormInput,
} from "@/lib/schemas/transactions";

const PATH = "/office/purchases/debit-notes";

// Thin proxies to the Go backend.

export async function createDebitNote(input: TransactionFormInput) {
  const parsed = transactionFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const { id } = await api.post<{ id: string }>("/debit-notes", parsed.data);
  revalidatePath(PATH);
  redirect(`${PATH}/${id}`);
}

export async function setDebitNoteStatus(id: string, status: "open" | "closed" | "void") {
  await api.patch(`/debit-notes/${id}/status`, { status });
  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
}

export async function deleteDebitNote(id: string) {
  await api.delete(`/debit-notes/${id}`);
  revalidatePath(PATH);
  redirect(PATH);
}

export async function deleteDebitNotes(ids: string[]) {
  if (!ids.length) return;
  await api.post("/debit-notes/bulk-delete", { ids });
  revalidatePath(PATH);
}
