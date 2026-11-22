import { notFound } from "next/navigation";

import { InvoiceDetail } from "@/components/office/transactions/invoice-views";
import { ApiError, api } from "@/lib/api-client";

type DocDetailData = {
  id: string;
  number: string;
  date: string;
  contactId: string;
  status: "draft" | "sent" | "void" | "partially_paid" | "paid" | "overdue";
  reference: string | null;
  notes: string | null;
  terms: string | null;
  dueDate: string | null;
  amountPaid: number;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  customerName: string;
  lines: {
    id: string;
    itemId: string;
    itemName: string;
    description: string | null;
    quantity: number;
    rate: number;
    discountPercent: number;
    taxId: string;
    taxName: string | null;
    amount: number;
  }[];
};

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let data: DocDetailData;
  try {
    data = await api.get<DocDetailData>(`/invoices/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return <InvoiceDetail data={data} />;
}
