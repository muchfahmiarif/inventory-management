import { SalesReturnsList } from "@/components/office/transactions/sales-return-views";
import { api } from "@/lib/api-client";

type SalesReturnRow = {
  id: string;
  number: string;
  date: string;
  status: "draft" | "received" | "cancelled";
  customerName: string | null;
  total: number;
};

export default async function SalesReturnsPage() {
  const rows = await api.get<SalesReturnRow[]>("/sales-returns");

  return <SalesReturnsList data={rows} title="Sales Returns" />;
}
