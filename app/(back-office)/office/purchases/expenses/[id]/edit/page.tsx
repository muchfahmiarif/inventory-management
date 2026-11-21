import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import ExpenseForm from "@/components/office/transactions/expense-form";
import type { ExpenseFormValues } from "@/components/office/transactions/expense-form";
import { updateExpense } from "@/actions/expenses";
import { db } from "@/db";
import { contacts, expenseCategories, expenses } from "@/db/schema";

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
  if (!expense) notFound();

  const [vendorRows, categoryRows] = await Promise.all([
    db
      .select({ id: contacts.id, name: contacts.displayName })
      .from(contacts)
      .where(eq(contacts.type, "vendor"))
      .orderBy(asc(contacts.displayName)),
    db
      .select({ id: expenseCategories.id, name: expenseCategories.name })
      .from(expenseCategories)
      .orderBy(asc(expenseCategories.name)),
  ]);

  const defaults: ExpenseFormValues = {
    date: expense.date,
    vendorId: expense.vendorId ?? undefined,
    categoryId: expense.categoryId ?? undefined,
    description: expense.description ?? "",
    amount: String(expense.amount),
    notes: expense.notes ?? undefined,
  };

  return (
    <ExpenseForm
      mode="edit"
      expenseId={expense.id}
      defaultValues={defaults}
      vendors={vendorRows}
      categories={categoryRows}
    />
  );
}
