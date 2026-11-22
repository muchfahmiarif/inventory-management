import { notFound } from "next/navigation";

import { WarehouseDetail, type WarehouseDetailData } from "@/components/office/warehouse/warehouse-views";
import { ApiError, api } from "@/lib/api-client";

export default async function WarehouseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let w: WarehouseDetailData;
  try {
    w = await api.get<WarehouseDetailData>(`/warehouses/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return <WarehouseDetail data={w} />;
}
