import { notFound } from "next/navigation";

import { EstimateDetail } from "@/components/office/transactions/estimate-views";
import { ApiError, api } from "@/lib/api-client";

type DocDetailData = {
  id: string;
  number: string;
  date: string;
  contactId: string;
  status: "draft" | "sent" | "viewed" | "accepted" | "declined" | "expired";
  reference: string | null;
  notes: string | null;
  terms: string | null;
  expiryDate: string | null;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  customerName: string;
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

export default async function EstimateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let data: DocDetailData;
  try {
    data = await api.get<DocDetailData>(`/estimates/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return <EstimateDetail data={data} />;
}
