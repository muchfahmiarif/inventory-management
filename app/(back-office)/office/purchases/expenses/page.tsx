import { desc, eq } from "drizzle-orm";

import { ExpensesList } from "@/components/office/transactions/expense-views";
import { db } from "@/db";
import { contacts, expenseCategories, expenses } from "@/db/schema";

export default async function ExpensesPage() {
  const rows = await db
    .select({
      id: expenses.id,
      number: expenses.number,
      date: expenses.date,
      description: expenses.description,
      vendorName: contacts.displayName,
      categoryName: expenseCategories.name,
      amount: expenses.amount,
    })
    .from(expenses)
    .leftJoin(contacts, eq(expenses.vendorId, contacts.id))
    .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
    .orderBy(desc(expenses.date), desc(expenses.createdAt));

  return <ExpensesList data={rows} title="Expenses" />;
}
