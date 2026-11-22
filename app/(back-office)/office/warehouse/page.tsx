import { WarehousesList, type WarehouseRow } from "@/components/office/warehouse/warehouse-views";
import { api } from "@/lib/api-client";

export default async function WarehousesPage() {
  const data = await api.get<WarehouseRow[]>("/warehouses");

  return <WarehousesList data={data} />;
}
