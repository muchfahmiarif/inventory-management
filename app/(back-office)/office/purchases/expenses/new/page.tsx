import { asc, eq } from "drizzle-orm";

import ExpenseForm from "@/components/office/transactions/expense-form";
import { db } from "@/db";
import { contacts, expenseCategories } from "@/db/schema";

export default async function NewExpensePage() {
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

  return (
    <ExpenseForm
      mode="new"
      defaultValues={{ date: new Date().toISOString().slice(0, 10), description: "", amount: "" }}
      vendors={vendorRows}
      categories={categoryRows}
    />
  );
}

