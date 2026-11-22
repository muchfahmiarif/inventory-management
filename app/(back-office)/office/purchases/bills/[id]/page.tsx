import { notFound } from "next/navigation";

import { BillDetail } from "@/components/office/transactions/bill-views";
import { ApiError, api } from "@/lib/api-client";

type BillDetailData = {
  id: string;
  number: string;
  date: string;
  contactId: string;
  status: string;
  reference: string | null;
  notes: string | null;
  terms: string | null;
  dueDate: string | null;
  amountPaid: number;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  vendorName: string;
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

export default async function BillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let data: BillDetailData;
  try {
    data = await api.get<BillDetailData>(`/bills/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return <BillDetail data={data} />;
}
