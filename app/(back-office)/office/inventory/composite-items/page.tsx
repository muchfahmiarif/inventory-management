import { CompositeItemsList, type CompositeItemRow } from "@/components/office/inventory/composite-items/composite-item-views";
import { api } from "@/lib/api-client";

const VIEW_NAMES: Record<string, string> = {
  all: "All Composite Items",
  active: "Active Composite Items",
  inactive: "Inactive Composite Items",
};

export default async function CompositeItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view = "all" } = await searchParams;

  const data = await api.get<CompositeItemRow[]>(`/composite-items?view=${encodeURIComponent(view)}`);

  return (
    <CompositeItemsList data={data} view={view} title={VIEW_NAMES[view] ?? "All Composite Items"} />
  );
}
