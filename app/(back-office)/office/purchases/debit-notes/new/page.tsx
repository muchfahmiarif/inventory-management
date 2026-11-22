import TransactionForm from "@/components/office/transactions/transaction-form";
import { createDebitNote } from "@/actions/debit-notes";
import { api } from "@/lib/api-client";

type TxnOptions = {
  contacts: { id: string; name: string }[];
  items: { id: string; name: string; sellingPrice: number | null }[];
  taxes: { id: string; name: string; rate: number }[];
};

export default async function NewDebitNotePage() {
  const options = await api.get<TxnOptions>("/txn-form-options?contactType=vendor");

  return (
    <TransactionForm
      mode="new"
      title="New Debit Note"
      contactLabel="Vendor"
      submitAction={createDebitNote}
      defaultValues={{
        date: new Date().toISOString().slice(0, 10),
        contactId: "",
        lines: [{ itemId: "", quantity: "1", rate: "0", discountPercent: "0", taxId: "none" }],
      }}
      contacts={options.contacts}
      items={options.items}
      taxes={options.taxes}
    />
  );
}
