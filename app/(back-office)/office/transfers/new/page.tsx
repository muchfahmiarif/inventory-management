import { TransferForm } from "@/components/office/transfers/transfer-views";
import { api } from "@/lib/api-client";

type TransferOptions = {
  warehouses: { id: string; name: string }[];
  items: { id: string; name: string; sku: string | null }[];
};

export default async function NewTransferPage() {
  const options = await api.get<TransferOptions>("/transfers/form-options");

  return (
    <TransferForm
      defaultValues={{
        date: new Date().toISOString().slice(0, 10),
        fromWarehouseId: options.warehouses[0]?.id ?? "",
        toWarehouseId: options.warehouses[1]?.id ?? "",
        lines: [{ itemId: "", quantity: "1" }],
      }}
      warehouses={options.warehouses}
      items={options.items}
    />
  );
}
