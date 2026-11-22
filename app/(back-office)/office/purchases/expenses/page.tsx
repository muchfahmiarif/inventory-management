import { ExpensesList } from "@/components/office/transactions/expense-views";
import { api } from "@/lib/api-client";

type ExpenseRow = {
  id: string;
  number: string;
  date: string;
  description: string;
  status: string;
  vendorName: string | null;
  categoryName: string | null;
  amount: number;
};

export default async function ExpensesPage() {
  const rows = await api.get<ExpenseRow[]>("/expenses");

  return <ExpensesList data={rows} title="Expenses" />;
}
