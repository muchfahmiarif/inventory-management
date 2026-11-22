import { notFound } from "next/navigation";

import { DebitNoteDetail } from "@/components/office/transactions/debit-note-views";
import { ApiError, api } from "@/lib/api-client";

type DebitNoteDetailData = {
  id: string;
  number: string;
  date: string;
  contactId: string;
  status: "open" | "closed" | "void";
  reference: string | null;
  notes: string | null;
  terms: string | null;
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

export default async function DebitNoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let data: DebitNoteDetailData;
  try {
    data = await api.get<DebitNoteDetailData>(`/debit-notes/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return <DebitNoteDetail data={data} />;
}
