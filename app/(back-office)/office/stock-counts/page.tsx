import { StockCountsList } from "@/components/office/stock-counts/stock-count-views";
import { api } from "@/lib/api-client";

type StockCountRow = {
  id: string;
  number: string;
  date: string;
  status: "draft" | "completed";
  warehouseName: string | null;
};

export default async function StockCountsPage() {
  const rows = await api.get<StockCountRow[]>("/stock-counts");

  return <StockCountsList data={rows} />;
}
