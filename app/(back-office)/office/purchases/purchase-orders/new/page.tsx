import TransactionForm from "@/components/office/transactions/transaction-form";
import { createPurchaseOrder } from "@/actions/purchase-orders";
import { api } from "@/lib/api-client";

type TxnOptions = {
  contacts: { id: string; name: string }[];
  items: { id: string; name: string; sellingPrice: number | null }[];
  taxes: { id: string; name: string; rate: number }[];
};

export default async function NewPurchaseOrderPage() {
  const options = await api.get<TxnOptions>("/txn-form-options?contactType=vendor");

  return (
    <TransactionForm
      mode="new"
      title="New Purchase Order"
      contactLabel="Vendor"
      submitAction={createPurchaseOrder}
      defaultValues={{
        date: new Date().toISOString().slice(0, 10),
        contactId: "",
        lines: [{ itemId: "", quantity: "1", rate: "0", discountPercent: "0", taxId: "none" }],
      }}
      contacts={options.contacts}
      items={options.items}
      taxes={options.taxes}
      extraDateLabel="Expected Delivery Date"
      extraDateKey="expiryDate"
    />
  );
}
