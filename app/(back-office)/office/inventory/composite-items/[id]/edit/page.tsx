import { asc, eq, ne } from "drizzle-orm";
import { notFound } from "next/navigation";

import CompositeItemForm from "@/components/office/inventory/composite-items/composite-item-form";
import { db } from "@/db";
import {
  brands,
  categories,
  compositeComponents,
  compositeItems,
  items,
  units,
} from "@/db/schema";

export default async function EditCompositeItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [composite] = await db
    .select()
    .from(compositeItems)
    .where(eq(compositeItems.id, id));
  if (!composite) notFound();

  const [unitRows, brandRows, categoryRows, itemRows, componentRows] = await Promise.all([
    db.select({ id: units.id, name: units.name }).from(units).orderBy(asc(units.name)),
    db.select({ id: brands.id, name: brands.name }).from(brands).orderBy(asc(brands.name)),
    db
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .orderBy(asc(categories.name)),
    db
      .select({ id: items.id, name: items.name, costPrice: items.costPrice })
      .from(items)
      .where(ne(items.type, "service"))
      .orderBy(asc(items.name)),
    db
      .select({ itemId: compositeComponents.itemId, quantity: compositeComponents.quantity })
      .from(compositeComponents)
      .where(eq(compositeComponents.compositeItemId, id))
      .orderBy(asc(compositeComponents.id)),
  ]);

  return (
    <CompositeItemForm
      mode="edit"
      compositeItemId={composite.id}
      defaultValues={{
        name: composite.name,
        sku: composite.sku ?? undefined,
        unitId: composite.unitId ?? undefined,
        brandId: composite.brandId ?? undefined,
        categoryId: composite.categoryId ?? undefined,
        description: composite.description ?? undefined,
        components: componentRows.map((c) => ({
          itemId: c.itemId,
          quantity: String(c.quantity),
        })),
      }}
      options={{
        units: unitRows,
        brands: brandRows,
        categories: categoryRows,
        items: itemRows,
      }}
    />
  );
}
