import { PriceListsList, type PriceListRow } from "@/components/office/inventory/price-lists/price-list-views";
import { api } from "@/lib/api-client";

export default async function PriceListsPage() {
  const data = await api.get<PriceListRow[]>("/price-lists");

  return <PriceListsList data={data} title="All Price Lists" />;
}
