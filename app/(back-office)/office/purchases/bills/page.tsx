import { BillsList } from "@/components/office/transactions/bill-views";
import { api } from "@/lib/api-client";

type BillRow = {
  id: string;
  number: string;
  date: string;
  status: string;
  vendorName: string | null;
  total: number;
};

export default async function BillsPage() {
  const rows = await api.get<BillRow[]>("/bills");

  return <BillsList data={rows} title="Bills" />;
}
