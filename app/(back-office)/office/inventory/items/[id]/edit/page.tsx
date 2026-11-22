import { notFound } from "next/navigation";

import ItemForm, { type ItemFormValues } from "@/components/office/inventory/items/item-form";
import { ApiError, api } from "@/lib/api-client";

type ItemDetailData = {
  id: string;
  name: string;
  sku: string | null;
  type: "inventory" | "non_inventory" | "service";
  description: string | null;
  unitId: string | null;
  brandId: string | null;
  categoryId: string | null;
  groupId: string | null;
  taxId: string | null;
  preferredVendorId: string | null;
  costPrice: number | null;
  sellingPrice: number | null;
  wholesalePrice: number | null;
  reorderLevel: number | null;
};

type ItemFormOptions = {
  units: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  groups: { id: string; name: string }[];
  taxes: { id: string; name: string }[];
  warehouses: { id: string; name: string }[];
  vendors: { id: string; name: string }[];
};

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let item: ItemDetailData;
  try {
    item = await api.get<ItemDetailData>(`/items/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
  const options = await api.get<ItemFormOptions>("/items/form-options");

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
