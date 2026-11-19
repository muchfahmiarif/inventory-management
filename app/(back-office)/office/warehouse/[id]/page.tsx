import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { WarehouseDetail } from "@/components/office/warehouse/warehouse-views";
import { db } from "@/db";
import { warehouses } from "@/db/schema";

export default async function WarehouseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [w] = await db.select().from(warehouses).where(eq(warehouses.id, id));
  if (!w) notFound();

  return <WarehouseDetail data={w} />;
}
