import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { ExpenseDetail } from "@/components/office/transactions/expense-views";
import { db } from "@/db";
import { contacts, expenseCategories, expenses } from "@/db/schema";

export default async function ExpenseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [expense] = await db
    .select({
      id: expenses.id,
      number: expenses.number,
      date: expenses.date,
      description: expenses.description,
      status: expenses.status,
      vendorName: contacts.displayName,
      categoryName: expenseCategories.name,
      amount: expenses.amount,
      notes: expenses.notes,
    })
    .from(expenses)
    .leftJoin(contacts, eq(expenses.vendorId, contacts.id))
    .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
    .where(eq(expenses.id, id));

  if (!expense) notFound();

  return <ExpenseDetail data={expense} />;
}
