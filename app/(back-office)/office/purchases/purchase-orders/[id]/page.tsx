import { notFound } from "next/navigation";

import { PurchaseOrderDetail } from "@/components/office/transactions/purchase-order-views";
import { ApiError, api } from "@/lib/api-client";

type PODetailData = {
  id: string;
  number: string;
  date: string;
  contactId: string;
  status: "open" | "draft" | "partially_received" | "received" | "billed" | "cancelled";
  reference: string | null;
  notes: string | null;
  terms: string | null;
  expectedDeliveryDate: string | null;
  warehouseName: string | null;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  vendorName: string;
  lines: {
    id: string;
    itemId: string;
    itemName: string;
    description: string | null;
    quantity: number;
    rate: number;
    discountPercent: number;
    taxId: string;
    taxName: string | null;
    amount: number;
  }[];
};

export default async function PurchaseOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let data: PODetailData;
  try {
    data = await api.get<PODetailData>(`/purchase-orders/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return <PurchaseOrderDetail data={data} />;
}
