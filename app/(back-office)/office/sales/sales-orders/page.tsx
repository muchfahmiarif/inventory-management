import { SalesOrdersList } from "@/components/office/transactions/sales-order-views";
import { api } from "@/lib/api-client";

type DocRow = {
  id: string;
  number: string;
  date: string;
  status: "draft" | "confirmed" | "packed" | "shipped" | "invoiced" | "fulfilled" | "cancelled";
  customerName: string | null;
  total: number;
};

export default async function SalesOrdersPage() {
  const rows = await api.get<DocRow[]>("/sales-orders");

  return <SalesOrdersList data={rows} title="Sales Orders" />;
}
