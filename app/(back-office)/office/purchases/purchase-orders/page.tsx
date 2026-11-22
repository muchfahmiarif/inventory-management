import { PurchaseOrdersList } from "@/components/office/transactions/purchase-order-views";
import { api } from "@/lib/api-client";

type PORow = {
  id: string;
  number: string;
  date: string;
  status: "open" | "draft" | "partially_received" | "received" | "billed" | "cancelled";
  vendorName: string | null;
  total: number;
};

export default async function PurchaseOrdersPage() {
  const rows = await api.get<PORow[]>("/purchase-orders");

  return <PurchaseOrdersList data={rows} title="Purchase Orders" />;
}
