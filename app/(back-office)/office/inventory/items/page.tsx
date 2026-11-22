import ItemsList, { type ItemRow } from "@/components/office/inventory/items/items-list";
import { api } from "@/lib/api-client";

const VIEW_NAMES: Record<string, string> = {
  all: "All Items",
  active: "Active Items",
  ungrouped: "Ungrouped Items",
  "low-stock": "Low Stock Items",
  sales: "Sales",
  purchases: "Purchases",
  inventory: "Inventory Items",
  "non-inventory": "Non Inventory Items",
  services: "Services",
  inactive: "Inactive Items",
  returned: "Returned Items",
  "non-returned": "Non Returned Items",
};

export default async function InventoryItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view = "all" } = await searchParams;

  // View filtering happens server-side in the Go backend.
  const data = await api.get<ItemRow[]>(`/items?view=${encodeURIComponent(view)}`);

  return <ItemsList data={data} view={view} title={VIEW_NAMES[view] ?? "All Items"} />;
}
