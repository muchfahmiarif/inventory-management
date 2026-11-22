"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { api } from "@/lib/api-client";

const PATH = "/office/purchases/expenses";

const expenseFormSchema = z.object({
  date: z.string().min(1, "Date is required"),
  vendorId: z.string().optional(),
  categoryId: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().positive("Amount must be > 0"),
  notes: z.string().optional(),
});

export type ExpenseFormInput = z.infer<typeof expenseFormSchema>;

// Thin proxies to the Go backend.

export async function createExpense(input: ExpenseFormInput) {
  const parsed = expenseFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const { id } = await api.post<{ id: string }>("/expenses", parsed.data);
  revalidatePath(PATH);
  redirect(`${PATH}/${id}`);
}

export async function updateExpense(id: string, input: ExpenseFormInput) {
  const parsed = expenseFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  await api.patch(`/expenses/${id}`, parsed.data);
  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
  redirect(`${PATH}/${id}`);
}

export async function deleteExpense(id: string) {
  await api.delete(`/expenses/${id}`);
  revalidatePath(PATH);
  redirect(PATH);
}

export async function deleteExpenses(ids: string[]) {
  if (!ids.length) return;
  await api.post("/expenses/bulk-delete", { ids });
  revalidatePath(PATH);
}
