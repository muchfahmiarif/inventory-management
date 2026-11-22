import { notFound } from "next/navigation";

import { ShipmentDetail } from "@/components/office/transactions/package-shipment-views";
import { ApiError, api } from "@/lib/api-client";

type ShipmentDetailData = {
  id: string;
  number: string;
  date: string;
  status: "draft" | "shipped" | "delivered";
  carrier: string | null;
  trackingNumber: string | null;
  notes: string | null;
  customerName: string;
  lines: { id: string; itemName: string; quantity: number }[];
};

export default async function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let data: ShipmentDetailData;
  try {
    data = await api.get<ShipmentDetailData>(`/shipments/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return <ShipmentDetail data={data} />;
}
