import { notFound } from "next/navigation";

import { PriceListDetail, type PriceListDetailData } from "@/components/office/inventory/price-lists/price-list-views";
import { ApiError, api } from "@/lib/api-client";

export default async function PriceListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let data: PriceListDetailData;
  try {
    data = await api.get<PriceListDetailData>(`/price-lists/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return <PriceListDetail data={data} />;
}
