import { WarehouseForm } from "@/components/office/warehouse/warehouse-views";

export default function NewWarehousePage() {
  return <WarehouseForm mode="new" defaultValues={{ name: "", isDefault: false }} />;
}
