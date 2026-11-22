import { notFound } from "next/navigation";

import { TransferDetail } from "@/components/office/transfers/transfer-views";
import { ApiError, api } from "@/lib/api-client";

type TransferDetailData = {
  id: string;
  number: string;
  date: string;
  status: "draft" | "shipped" | "received";
  notes: string | null;
  fromWarehouseName: string | null;
  toWarehouseName: string | null;
  lines: { id: string; itemName: string; sku: string | null; quantity: number }[];
};

export default async function TransferDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let data: TransferDetailData;
  try {
    data = await api.get<TransferDetailData>(`/transfers/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return <TransferDetail data={data} />;
}
