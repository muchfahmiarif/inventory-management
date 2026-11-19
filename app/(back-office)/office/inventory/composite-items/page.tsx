import { asc, eq, sql } from "drizzle-orm";

import { CompositeItemsList } from "@/components/office/inventory/composite-items/composite-item-views";
import { db } from "@/db";
import { compositeComponents, compositeItems, items } from "@/db/schema";

const VIEW_NAMES: Record<string, string> = {
  all: "All Composite Items",
  active: "Active Composite Items",
  inactive: "Inactive Composite Items",
};

export default async function CompositeItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view = "all" } = await searchParams;

  const rows = await db
    .select({
      id: compositeItems.id,
      name: compositeItems.name,
      sku: compositeItems.sku,
      status: compositeItems.status,
      componentCount: sql<number>`count(${compositeComponents.id})::int`,
      totalCost: sql<number>`coalesce(sum(${items.costPrice} * ${compositeComponents.quantity}), 0)::float8`,
    })
    .from(compositeItems)
    .leftJoin(compositeComponents, eq(compositeComponents.compositeItemId, compositeItems.id))
    .leftJoin(items, eq(compositeComponents.itemId, items.id))
    .groupBy(compositeItems.id)
    .orderBy(asc(compositeItems.name));

  const data = rows.filter((r) => {
    if (view === "active") return r.status === "active";
    if (view === "inactive") return r.status === "inactive";
    return true;
  });

  return (
    <CompositeItemsList data={data} view={view} title={VIEW_NAMES[view] ?? "All Composite Items"} />
  );
}
