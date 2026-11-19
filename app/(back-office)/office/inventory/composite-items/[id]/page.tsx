import { asc, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { CompositeItemDetail } from "@/components/office/inventory/composite-items/composite-item-views";
import { db } from "@/db";
import {
  activityLog,
  compositeComponents,
  compositeItems,
  items,
  units,
} from "@/db/schema";

export default async function CompositeItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [composite] = await db
    .select({
      id: compositeItems.id,
      name: compositeItems.name,
      sku: compositeItems.sku,
      description: compositeItems.description,
      status: compositeItems.status,
      unitName: units.name,
    })
    .from(compositeItems)
    .leftJoin(units, eq(compositeItems.unitId, units.id))
    .where(eq(compositeItems.id, id));

  if (!composite) notFound();

  const components = await db
    .select({
      id: compositeComponents.id,
      itemName: items.name,
      quantity: compositeComponents.quantity,
      costPrice: items.costPrice,
    })
    .from(compositeComponents)
    .innerJoin(items, eq(compositeComponents.itemId, items.id))
    .where(eq(compositeComponents.compositeItemId, id))
    .orderBy(asc(items.name));

  const history = await db
    .select({
      id: activityLog.id,
      action: activityLog.action,
      createdAt: activityLog.createdAt,
    })
    .from(activityLog)
    .where(eq(activityLog.entityType, "composite_item"))
    .orderBy(desc(activityLog.createdAt));

  return (
    <CompositeItemDetail
      data={{
        ...composite,
        components: components.map((c) => ({
          id: c.id,
          itemName: c.itemName,
          quantity: Number(c.quantity),
          costPrice: c.costPrice,
        })),
        history: history.map((h) => ({
          id: h.id,
          action: h.action,
          createdAt: h.createdAt.toISOString(),
        })),
      }}
    />
  );
}
