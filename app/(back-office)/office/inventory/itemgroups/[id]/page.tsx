import { asc, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import ItemGroupDetail from "@/components/office/inventory/itemgroups/item-group-detail";
import { db } from "@/db";
import { activityLog, itemGroupAttributes, itemGroups, items } from "@/db/schema";

export default async function ItemGroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [group] = await db.select().from(itemGroups).where(eq(itemGroups.id, id));
  if (!group) notFound();

  const attributes = await db
    .select({ id: itemGroupAttributes.id, name: itemGroupAttributes.name })
    .from(itemGroupAttributes)
    .where(eq(itemGroupAttributes.groupId, id))
    .orderBy(asc(itemGroupAttributes.sortOrder));

  const groupItems = await db
    .select({
      id: items.id,
      name: items.name,
      sku: items.sku,
      sellingPrice: items.sellingPrice,
    })
    .from(items)
    .where(eq(items.groupId, id))
    .orderBy(asc(items.name));

  const history = await db
    .select({
      id: activityLog.id,
      action: activityLog.action,
      createdAt: activityLog.createdAt,
    })
    .from(activityLog)
    .where(eq(activityLog.entityType, "item_group"))
    .orderBy(desc(activityLog.createdAt));

  return (
    <ItemGroupDetail
      data={{
        id: group.id,
        name: group.name,
        description: group.description,
        status: group.status,
        attributes,
        items: groupItems,
        history: history.map((h) => ({
          id: h.id,
          action: h.action,
          createdAt: h.createdAt.toISOString(),
        })),
      }}
    />
  );
}
