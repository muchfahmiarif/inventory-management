import { notFound } from "next/navigation";

import { SalesReturnDetail } from "@/components/office/transactions/sales-return-views";
import { ApiError, api } from "@/lib/api-client";

type SalesReturnDetailData = {
  id: string;
  number: string;
  date: string;
  status: "draft" | "received" | "cancelled";
  reference: string | null;
  notes: string | null;
  total: number;
  customerName: string;
  warehouseName: string | null;
  lines: { id: string; itemName: string; quantity: number; rate: number; amount: number }[];
};

export default async function SalesReturnDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let data: SalesReturnDetailData;
  try {
    data = await api.get<SalesReturnDetailData>(`/sales-returns/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return <SalesReturnDetail data={data} />;
}
