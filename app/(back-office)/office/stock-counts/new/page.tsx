import { StockCountForm } from "@/components/office/stock-counts/stock-count-views";
import { api } from "@/lib/api-client";

type StockCountOptions = {
  warehouses: { id: string; name: string }[];
  items: { id: string; name: string; sku: string | null }[];
  stockByItem: Record<string, number>;
};

export default async function NewStockCountPage() {
  const options = await api.get<StockCountOptions>("/stock-counts/form-options");

  return (
    <StockCountForm
      defaultValues={{
        date: new Date().toISOString().slice(0, 10),
        warehouseId: options.warehouses[0]?.id ?? "",
        lines: [{ itemId: "", countedQuantity: "" }],
      }}
      warehouses={options.warehouses}
      items={options.items}
      stockByItem={options.stockByItem}
    />
  );
}
