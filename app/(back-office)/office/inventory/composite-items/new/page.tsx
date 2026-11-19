import { asc, ne } from "drizzle-orm";

import CompositeItemForm from "@/components/office/inventory/composite-items/composite-item-form";
import { db } from "@/db";
import { brands, categories, items, units } from "@/db/schema";

export default async function NewCompositeItemPage() {
  const [unitRows, brandRows, categoryRows, itemRows] = await Promise.all([
    db.select({ id: units.id, name: units.name }).from(units).orderBy(asc(units.name)),
    db.select({ id: brands.id, name: brands.name }).from(brands).orderBy(asc(brands.name)),
    db
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .orderBy(asc(categories.name)),
    db
      .select({
        id: items.id,
        name: items.name,
        costPrice: items.costPrice,
        type: items.type,
      })
      .from(items)
      .where(ne(items.type, "service"))
      .orderBy(asc(items.name)),
  ]);

  return (
    <CompositeItemForm
      mode="new"
      defaultValues={{ name: "", components: [{ itemId: "", quantity: "1" }] }}
      options={{
        units: unitRows,
        brands: brandRows,
        categories: categoryRows,
        items: itemRows.map((i) => ({ id: i.id, name: i.name, costPrice: i.costPrice })),
      }}
    />
  );
}
