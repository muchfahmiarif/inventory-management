import { notFound } from "next/navigation";

import TransactionForm from "@/components/office/transactions/transaction-form";
import type { TransactionFormValues } from "@/components/office/transactions/transaction-form";
import { updateInvoice } from "@/actions/invoices";
import { ApiError, api } from "@/lib/api-client";

type DocDetailData = {
  id: string;
  number: string;
  date: string;
  contactId: string;
  status: "draft" | "sent" | "void" | "partially_paid" | "paid" | "overdue";
  reference: string | null;
  notes: string | null;
  terms: string | null;
  dueDate: string | null;
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

type TxnOptions = {
  contacts: { id: string; name: string }[];
  items: { id: string; name: string; sellingPrice: number | null }[];
  taxes: { id: string; name: string; rate: number }[];
};

export default async function EditInvoicesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let doc: DocDetailData;
  try {
    doc = await api.get<DocDetailData>(`/invoices/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
  const options = await api.get<TxnOptions>("/txn-form-options");

  const defaults: TransactionFormValues = {
    date: doc.date,
    contactId: doc.contactId,
    reference: doc.reference ?? undefined,
    expiryDate: doc.dueDate ?? undefined,
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
      contactLabel="Customer"
      submitAction={updateInvoice.bind(null, doc.id)}
      defaultValues={defaults}
      contacts={options.contacts}
      items={options.items}
      taxes={options.taxes}
      extraDateLabel="Due Date"
      extraDateKey="expiryDate"
    />
  );
}
