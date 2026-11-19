import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import ItemGroupForm from "@/components/office/inventory/itemgroups/item-group-form";
import { db } from "@/db";
import { itemGroupAttributes, itemGroups } from "@/db/schema";

export default async function EditItemGroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [group] = await db.select().from(itemGroups).where(eq(itemGroups.id, id));
  if (!group) notFound();

  const attributes = await db
    .select({ name: itemGroupAttributes.name })
    .from(itemGroupAttributes)
    .where(eq(itemGroupAttributes.groupId, id))
    .orderBy(asc(itemGroupAttributes.sortOrder));

  return (
    <ItemGroupForm
      mode="edit"
      itemGroupId={group.id}
      defaultValues={{
        name: group.name,
        description: group.description ?? undefined,
        attributes: attributes.map((a) => ({ name: a.name })),
      }}
    />
  );
}
