import { notFound } from "next/navigation";

import { PackageDetail } from "@/components/office/transactions/package-shipment-views";
import { ApiError, api } from "@/lib/api-client";

type PackageDetailData = {
  id: string;
  number: string;
  date: string;
  status: "draft" | "shipped" | "delivered";
  notes: string | null;
  customerName: string;
  salesOrderId: string | null;
  salesOrderNumber: string | null;
  warehouseName: string | null;
  lines: { id: string; itemName: string; quantity: number; rate: number; amount: number }[];
};

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let data: PackageDetailData;
  try {
    data = await api.get<PackageDetailData>(`/packages/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return <PackageDetail data={data} />;
}
