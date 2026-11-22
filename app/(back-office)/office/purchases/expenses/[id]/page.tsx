import { notFound } from "next/navigation";

import { ExpenseDetail } from "@/components/office/transactions/expense-views";
import { ApiError, api } from "@/lib/api-client";

type ExpenseDetailData = {
  id: string;
  number: string;
  date: string;
  description: string;
  status: string;
  vendorName: string | null;
  categoryName: string | null;
  amount: number;
  notes: string | null;
  vendorId: string | null;
  categoryId: string | null;
};

export default async function ExpenseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let data: ExpenseDetailData;
  try {
    data = await api.get<ExpenseDetailData>(`/expenses/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return <ExpenseDetail data={data} />;
}
