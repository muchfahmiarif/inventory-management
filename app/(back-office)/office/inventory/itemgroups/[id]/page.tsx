import { notFound } from "next/navigation";

import ItemGroupDetail, { type ItemGroupDetailData } from "@/components/office/inventory/itemgroups/item-group-detail";
import { ApiError, api } from "@/lib/api-client";

export default async function ItemGroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let data: ItemGroupDetailData;
  try {
    data = await api.get<ItemGroupDetailData>(`/item-groups/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return <ItemGroupDetail data={data} />;
}
