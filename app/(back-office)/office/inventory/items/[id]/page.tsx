import { notFound } from "next/navigation";

import ItemDetail from "@/components/office/inventory/items/item-detail";
import { ApiError, api } from "@/lib/api-client";

type ItemDetailData = {
  id: string;
  name: string;
  sku: string | null;
  type: "inventory" | "non_inventory" | "service";
  status: "active" | "inactive";
  description: string | null;
  costPrice: number | null;
  sellingPrice: number | null;
  wholesalePrice: number | null;
  reorderLevel: number | null;
  groupName: string | null;
  unitName: string | null;
  brandName: string | null;
  categoryName: string | null;
  taxName: string | null;
  taxRate: number | null;
  vendorName: string | null;
  stockOnHand: number;
  movements: {
    id: string;
    createdAt: string;
    sourceType: string;
    sourceNumber: string | null;
    warehouseName: string | null;
    quantity: number;
  }[];
  history: { id: string; action: string; createdAt: string }[];
};

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let data: ItemDetailData;
  try {
    data = await api.get<ItemDetailData>(`/items/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return <ItemDetail data={data} />;
}
