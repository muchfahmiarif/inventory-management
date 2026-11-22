import { DeliverChallansList } from "@/components/office/transactions/deliver-challan-views";
import { api } from "@/lib/api-client";

type DocRow = {
  id: string;
  number: string;
  date: string;
  status: "draft" | "sent" | "invoiced" | "cancelled";
  customerName: string | null;
  total: number;
};

export default async function DeliverChallansPage() {
  const rows = await api.get<DocRow[]>("/deliver-challans");

  return <DeliverChallansList data={rows} title="Deliver Challans" />;
}
