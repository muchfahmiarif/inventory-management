import { notFound } from "next/navigation";

import TransactionForm from "@/components/office/transactions/transaction-form";
import type { TransactionFormValues } from "@/components/office/transactions/transaction-form";
import { updatePurchaseOrder } from "@/actions/purchase-orders";
import { ApiError, api } from "@/lib/api-client";

type PODetailData = {
  id: string;
  number: string;
  date: string;
  contactId: string;
  status: string;
  reference: string | null;
  notes: string | null;
  terms: string | null;
  expectedDeliveryDate: string | null;
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

type TxnOptions = {
  contacts: { id: string; name: string }[];
  items: { id: string; name: string; sellingPrice: number | null }[];
  taxes: { id: string; name: string; rate: number }[];
};

export default async function EditPurchaseOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let doc: PODetailData;
  try {
    doc = await api.get<PODetailData>(`/purchase-orders/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
  const options = await api.get<TxnOptions>("/txn-form-options?contactType=vendor");

  const defaults: TransactionFormValues = {
    date: doc.date,
    contactId: doc.contactId,
    reference: doc.reference ?? undefined,
    expiryDate: doc.expectedDeliveryDate ?? undefined,
    notes: doc.notes ?? undefined,
    terms: doc.terms ?? undefined,
    lines: doc.lines.map((l) => ({
      itemId: l.itemId,
      description: l.description ?? undefined,
      quantity: String(l.quantity),
      rate: String(l.rate),
      discountPercent: String(l.discountPercent),
      taxId: l.taxId || "none",
    })),
  };

  return (
    <TransactionForm
      mode="edit"
      transactionId={doc.id}
      title={`Edit ${doc.number}`}
      contactLabel="Vendor"
      submitAction={updatePurchaseOrder.bind(null, doc.id)}
      defaultValues={defaults}
      contacts={options.contacts}
      items={options.items}
      taxes={options.taxes}
      extraDateLabel="Expected Delivery Date"
      extraDateKey="expiryDate"
    />
  );
}
