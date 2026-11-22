import AdjustmentForm from "@/components/office/inventory/adjustments/adjustment-form";
import { api } from "@/lib/api-client";

type AdjustmentOptions = {
  warehouses: { id: string; name: string }[];
  items: { id: string; name: string; sku: string | null; unitName: string | null }[];
  stockByItem: Record<string, number>;
};

export default async function NewAdjustmentPage() {
  const options = await api.get<AdjustmentOptions>("/adjustments/form-options");

  return (
    <AdjustmentForm
      defaultValues={{
        date: new Date().toISOString().slice(0, 10),
        warehouseId: options.warehouses[0]?.id ?? "",
        lines: [{ itemId: "", systemQuantity: "0", adjustedQuantity: "0" }],
      }}
      warehouses={options.warehouses}
      items={options.items}
      stockByItem={options.stockByItem}
    />
  );
}
