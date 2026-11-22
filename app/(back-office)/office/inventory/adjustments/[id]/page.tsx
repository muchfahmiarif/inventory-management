import { notFound } from "next/navigation";

import { AdjustmentDetail } from "@/components/office/inventory/adjustments/adjustment-views";
import { ApiError, api } from "@/lib/api-client";

type AdjustmentDetailData = {
  id: string;
  number: string;
  date: string;
  reference: string | null;
  reason: string | null;
  warehouseName: string | null;
  lines: {
    id: string;
    itemName: string;
    sku: string | null;
    systemQuantity: number;
    adjustedQuantity: number;
  }[];
};

export default async function AdjustmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let data: AdjustmentDetailData;
  try {
    data = await api.get<AdjustmentDetailData>(`/adjustments/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return <AdjustmentDetail data={data} />;
}
