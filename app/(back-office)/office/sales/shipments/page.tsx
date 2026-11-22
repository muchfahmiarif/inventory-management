import { ShipmentsList } from "@/components/office/transactions/package-shipment-views";
import { api } from "@/lib/api-client";

type ShipmentRow = {
  id: string;
  number: string;
  date: string;
  status: "draft" | "shipped" | "delivered";
  customerName: string | null;
  carrier: string | null;
  trackingNumber: string | null;
};

export default async function ShipmentsPage() {
  const rows = await api.get<ShipmentRow[]>("/shipments");

  return <ShipmentsList data={rows} title="Shipments" />;
}
