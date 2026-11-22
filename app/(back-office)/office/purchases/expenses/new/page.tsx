import ExpenseForm from "@/components/office/transactions/expense-form";
import { createExpense } from "@/actions/expenses";
import { api } from "@/lib/api-client";

type ExpenseOptions = {
  vendors: { id: string; name: string }[];
  categories: { id: string; name: string }[];
};

export default async function NewExpensePage() {
  const options = await api.get<ExpenseOptions>("/expenses/form-options");

  return (
    <ExpenseForm
      mode="new"
      defaultValues={{
        date: new Date().toISOString().slice(0, 10),
        vendorId: "",
        categoryId: "",
        description: "",
        amount: "",
        notes: "",
      }}
      vendors={options.vendors}
      categories={options.categories}
    />
  );
}
