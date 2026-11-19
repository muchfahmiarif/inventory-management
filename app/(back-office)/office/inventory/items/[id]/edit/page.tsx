import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import ItemForm, { ItemFormValues } from "@/components/office/inventory/items/item-form";
import { db } from "@/db";
import { items } from "@/db/schema";
import { getItemFormOptions } from "@/lib/item-options";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [item] = await db.select().from(items).where(eq(items.id, id));
  if (!item) notFound();

  const options = await getItemFormOptions();

  const defaultValues: ItemFormValues = {
    name: item.name,
    type: item.type,
    sku: item.sku ?? undefined,
    unitId: item.unitId ?? undefined,
    brandId: item.brandId ?? undefined,
    categoryId: item.categoryId ?? undefined,
    groupId: item.groupId ?? undefined,
    taxId: item.taxId ?? undefined,
    preferredVendorId: item.preferredVendorId ?? undefined,
    description: item.description ?? undefined,
    costPrice: item.costPrice !== null ? String(item.costPrice) : undefined,
    sellingPrice: item.sellingPrice !== null ? String(item.sellingPrice) : undefined,
    wholesalePrice: item.wholesalePrice !== null ? String(item.wholesalePrice) : undefined,
    reorderLevel: item.reorderLevel !== null ? String(item.reorderLevel) : undefined,
  };

  return <ItemForm mode="edit" itemId={item.id} defaultValues={defaultValues} options={options} />;
}
