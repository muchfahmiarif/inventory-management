import { notFound } from "next/navigation";

import { CompositeItemDetail, type CompositeItemDetailData } from "@/components/office/inventory/composite-items/composite-item-views";
import { ApiError, api } from "@/lib/api-client";

export default async function CompositeItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let data: CompositeItemDetailData;
  try {
    data = await api.get<CompositeItemDetailData>(`/composite-items/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return <CompositeItemDetail data={data} />;
}
