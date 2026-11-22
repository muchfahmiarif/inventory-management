import { notFound } from "next/navigation";

import { WarehouseForm, type WarehouseFormValues, type WarehouseDetailData } from "@/components/office/warehouse/warehouse-views";
import { ApiError, api } from "@/lib/api-client";

export default async function EditWarehousePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let w: WarehouseDetailData;
  try {
    w = await api.get<WarehouseDetailData>(`/warehouses/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <WarehouseForm
      mode="edit"
      warehouseId={w.id}
      defaultValues={{
        name: w.name,
        code: w.code ?? undefined,
        addressLine1: w.addressLine1 ?? undefined,
        city: w.city ?? undefined,
        state: w.state ?? undefined,
        zip: w.zip ?? undefined,
        country: w.country ?? undefined,
        contactName: w.contactName ?? undefined,
        phone: w.phone ?? undefined,
        email: w.email ?? undefined,
        isDefault: w.isDefault,
      }}
    />
  );
}
