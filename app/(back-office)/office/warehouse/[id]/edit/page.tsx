import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { WarehouseForm } from "@/components/office/warehouse/warehouse-views";
import { db } from "@/db";
import { warehouses } from "@/db/schema";

export default async function EditWarehousePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [w] = await db.select().from(warehouses).where(eq(warehouses.id, id));
  if (!w) notFound();

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
