import { EstimatesList } from "@/components/office/transactions/estimate-views";
import { api } from "@/lib/api-client";

type DocRow = {
  id: string;
  number: string;
  date: string;
  status: "draft" | "sent" | "viewed" | "accepted" | "declined" | "expired";
  customerName: string | null;
  total: number;
};

export default async function EstimatesPage() {
  const rows = await api.get<DocRow[]>("/estimates");

  return <EstimatesList data={rows} title="Estimates" />;
}
