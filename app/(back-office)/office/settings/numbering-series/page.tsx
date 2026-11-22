import { NumberingSeriesClient } from "@/components/office/settings/numbering-series-client";
import { api } from "@/lib/api-client";

type SeriesRow = { module: string; prefix: string; nextNumber: number; padding: number };

export default async function NumberingSeriesPage() {
  const rows = await api.get<SeriesRow[]>("/settings/numbering-series");

  return <NumberingSeriesClient rows={rows} />;
}
