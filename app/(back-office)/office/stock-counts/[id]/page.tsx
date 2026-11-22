import { notFound } from "next/navigation";

import { StockCountDetail } from "@/components/office/stock-counts/stock-count-views";
import { ApiError, api } from "@/lib/api-client";

type StockCountDetailData = {
  id: string;
  number: string;
  date: string;
  status: "draft" | "completed";
  notes: string | null;
  warehouseName: string | null;
  lines: {
    id: string;
    itemName: string;
    systemQuantity: number;
    countedQuantity: number | null;
  }[];
};

export default async function StockCountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let data: StockCountDetailData;
  try {
    data = await api.get<StockCountDetailData>(`/stock-counts/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return <StockCountDetail data={data} />;
}
