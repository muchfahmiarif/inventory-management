import TransactionForm from "@/components/office/transactions/transaction-form";
import { createDeliverChallan } from "@/actions/deliver-challans";
import { api } from "@/lib/api-client";

type TxnOptions = {
  contacts: { id: string; name: string }[];
  items: { id: string; name: string; sellingPrice: number | null }[];
  taxes: { id: string; name: string; rate: number }[];
};

export default async function NewDeliverChallansPage() {
  const options = await api.get<TxnOptions>("/txn-form-options");

  return (
    <TransactionForm
      mode="new"
      title="New Deliver Challan"
      contactLabel="Customer"
      submitAction={createDeliverChallan}
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
