import { notFound } from "next/navigation";

import { PriceListForm } from "@/components/office/inventory/price-lists/price-list-views";
import { ApiError, api } from "@/lib/api-client";

type PriceListEditData = {
  id: string;
  name: string;
  description: string | null;
  currencyCode: string;
  priceType: "markup" | "markdown";
  percentage: number;
};

type CurrencyOption = { code: string; name: string; symbol: string };

export default async function EditPriceListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let list: PriceListEditData;
  try {
    list = await api.get<PriceListEditData>(`/price-lists/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
  const currencies = await api.get<CurrencyOption[]>("/price-lists/currency-options");

  return (
    <PriceListForm
      mode="edit"
      priceListId={list.id}
      defaultValues={{
        name: list.name,
        description: list.description ?? undefined,
        currencyCode: list.currencyCode,
        priceType: list.priceType,
        percentage: String(list.percentage),
      }}
      currencies={currencies}
    />
  );
}
