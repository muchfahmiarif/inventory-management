import { notFound } from "next/navigation";

import ExpenseForm from "@/components/office/transactions/expense-form";
import { updateExpense } from "@/actions/expenses";
import { ApiError, api } from "@/lib/api-client";

type ExpenseDetailData = {
  id: string;
  number: string;
  date: string;
  description: string;
  notes: string | null;
  vendorId: string | null;
  categoryId: string | null;
  amount: number;
};

type ExpenseOptions = {
  vendors: { id: string; name: string }[];
  categories: { id: string; name: string }[];
};

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let expense: ExpenseDetailData;
  try {
    expense = await api.get<ExpenseDetailData>(`/expenses/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
  const options = await api.get<ExpenseOptions>("/expenses/form-options");

  return (
    <ExpenseForm
      mode="edit"
      expenseId={expense.id}
      defaultValues={{
        date: expense.date,
        vendorId: expense.vendorId ?? "",
        categoryId: expense.categoryId ?? "",
        description: expense.description,
        amount: String(expense.amount),
        notes: expense.notes ?? "",
      }}
      vendors={options.vendors}
      categories={options.categories}
    />
  );
}
