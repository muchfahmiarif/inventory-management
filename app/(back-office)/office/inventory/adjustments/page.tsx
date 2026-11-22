import { AdjustmentsList } from "@/components/office/inventory/adjustments/adjustment-views";
import { api } from "@/lib/api-client";

type AdjustmentRow = {
  id: string;
  number: string;
  date: string;
  reference: string | null;
  reason: string | null;
  warehouseName: string | null;
};

export default async function AdjustmentsPage() {
  const rows = await api.get<AdjustmentRow[]>("/adjustments");

  return <AdjustmentsList data={rows} title="All Adjustments" />;
}
