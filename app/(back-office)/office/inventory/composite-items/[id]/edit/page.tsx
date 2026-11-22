import { notFound } from "next/navigation";

import CompositeItemForm from "@/components/office/inventory/composite-items/composite-item-form";
import { ApiError, api } from "@/lib/api-client";

type CompositeEditData = {
  id: string;
  name: string;
  sku: string | null;
  unitId: string | null;
  brandId: string | null;
  categoryId: string | null;
  description: string | null;
  components: { id: string; itemId: string; itemName: string; quantity: number; costPrice: number | null }[];
};

type CompositeOptions = {
  units: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  items: { id: string; name: string; costPrice: number | null }[];
};

export default async function EditCompositeItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let composite: CompositeEditData;
  try {
    composite = await api.get<CompositeEditData>(`/composite-items/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
  const options = await api.get<CompositeOptions>("/composite-form-options");

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
        components: composite.components.map((c) => ({
          itemId: c.itemId,
          quantity: String(c.quantity),
        })),
      }}
      options={options}
    />
  );
}
