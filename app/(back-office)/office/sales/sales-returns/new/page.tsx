import SalesReturnForm from "@/components/office/transactions/sales-return-form";
import { api } from "@/lib/api-client";

type SROptions = {
  contacts: { id: string; name: string }[];
  warehouses: { id: string; name: string }[];
  items: { id: string; name: string; sellingPrice: number | null }[];
};

export default async function NewSalesReturnPage() {
  const options = await api.get<SROptions>("/sales-returns/form-options");

  return (
    <SalesReturnForm
      defaultValues={{
        date: new Date().toISOString().slice(0, 10),
        contactId: "",
        warehouseId: options.warehouses[0]?.id ?? "",
        lines: [{ itemId: "", quantity: "1", rate: "0" }],
      }}
      contacts={options.contacts}
      warehouses={options.warehouses}
      items={options.items}
    />
  );
}
