import { TransfersList } from "@/components/office/transfers/transfer-views";
import { api } from "@/lib/api-client";

type TransferRow = {
  id: string;
  number: string;
  date: string;
  status: "draft" | "shipped" | "received";
  fromWarehouseName: string | null;
  toWarehouseName: string | null;
};

export default async function TransfersPage() {
  const rows = await api.get<TransferRow[]>("/transfers");

  return <TransfersList data={rows} />;
}
