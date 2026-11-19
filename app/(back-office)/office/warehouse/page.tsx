import { asc } from "drizzle-orm";

import { WarehousesList } from "@/components/office/warehouse/warehouse-views";
import { db } from "@/db";
import { warehouses } from "@/db/schema";

export default async function WarehousesPage() {
  const data = await db
    .select({
      id: warehouses.id,
      name: warehouses.name,
      code: warehouses.code,
      city: warehouses.city,
      contactName: warehouses.contactName,
      isDefault: warehouses.isDefault,
    })
    .from(warehouses)
    .orderBy(asc(warehouses.name));

  return <WarehousesList data={data} />;
}
