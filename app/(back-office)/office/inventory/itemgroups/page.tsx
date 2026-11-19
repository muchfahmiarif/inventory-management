import { asc, eq, sql } from "drizzle-orm";

import ItemGroupsList from "@/components/office/inventory/itemgroups/item-groups-list";
import { db } from "@/db";
import { itemGroupAttributes, itemGroups, items } from "@/db/schema";

const VIEW_NAMES: Record<string, string> = {
  all: "All Item Groups",
  active: "Active Item Groups",
  inactive: "Inactive Item Groups",
};

export default async function ItemGroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view = "all" } = await searchParams;

  const rows = await db
    .select({
      id: itemGroups.id,
      name: itemGroups.name,
      description: itemGroups.description,
      status: itemGroups.status,
      itemCount: sql<number>`count(${items.id})::int`,
    })
    .from(itemGroups)
    .leftJoin(items, eq(items.groupId, itemGroups.id))
    .groupBy(itemGroups.id)
    .orderBy(asc(itemGroups.name));

  const attrCounts = await db
    .select({ groupId: itemGroupAttributes.groupId })
    .from(itemGroupAttributes);
  const attrCountByGroup = attrCounts.reduce<Record<string, number>>((acc, a) => {
    acc[a.groupId] = (acc[a.groupId] ?? 0) + 1;
    return acc;
  }, {});

  const data = rows
    .map((r) => ({ ...r, attributeCount: attrCountByGroup[r.id] ?? 0 }))
    .filter((r) => {
      if (view === "active") return r.status === "active";
      if (view === "inactive") return r.status === "inactive";
      return true;
    });

  return (
    <ItemGroupsList data={data} view={view} title={VIEW_NAMES[view] ?? "All Item Groups"} />
  );
}
