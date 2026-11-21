"use server";

import { inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import { expenses } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { nextNumber } from "@/lib/numbering";

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

export async function createExpense(input: ExpenseFormInput) {
  const parsed = expenseFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const data = parsed.data;

  const id = await db.transaction(async (tx) => {
    const number = await nextNumber(tx, "expenses");
    const [expense] = await tx
      .insert(expenses)
      .values({
        number,
        date: data.date,
        vendorId: data.vendorId || null,
        categoryId: data.categoryId || null,
        description: data.description,
        amount: data.amount,
        notes: data.notes || null,
        status: "recorded",
      })
      .returning();
    return expense.id;
  });

  await logActivity({
    action: "recorded expense",
    entityType: "expense",
    entityId: id,
    entityLabel: data.description,
  });

  revalidatePath(PATH);
  redirect(`${PATH}/${id}`);
}

export async function updateExpense(id: string, input: ExpenseFormInput) {
  const parsed = expenseFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const data = parsed.data;

  await db
    .update(expenses)
    .set({
      date: data.date,
      vendorId: data.vendorId || null,
      categoryId: data.categoryId || null,
      description: data.description,
      amount: data.amount,
      notes: data.notes || null,
      updatedAt: new Date(),
    })
    .where(inArray(expenses.id, [id]));

  await logActivity({
    action: "updated expense",
    entityType: "expense",
    entityId: id,
  });

  revalidatePath(PATH);
  redirect(`${PATH}/${id}`);
}

export async function deleteExpense(id: string) {
  await db.delete(expenses).where(inArray(expenses.id, [id]));
  await logActivity({
    action: "deleted expense",
    entityType: "expense",
    entityId: id,
  });
  revalidatePath(PATH);
  redirect(PATH);
}

export async function deleteExpenses(ids: string[]) {
  if (!ids.length) return;
  await db.delete(expenses).where(inArray(expenses.id, ids));
  revalidatePath(PATH);
}
