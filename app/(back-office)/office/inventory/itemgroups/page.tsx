import ItemGroupsList, { type ItemGroupRow } from "@/components/office/inventory/itemgroups/item-groups-list";
import { api } from "@/lib/api-client";

const VIEW_NAMES: Record<string, string> = {
  all: "All Item Groups",
  active: "Active Item Groups",
  inactive: "Inactive Item Groups",
};

export default async function ItemGroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view = "all" } = await searchParams;

  // View filtering happens server-side in the Go backend.
  const data = await api.get<ItemGroupRow[]>(`/item-groups?view=${encodeURIComponent(view)}`);

  return (
    <ItemGroupsList data={data} view={view} title={VIEW_NAMES[view] ?? "All Item Groups"} />
  );
}
