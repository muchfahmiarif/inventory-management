import { PriceListForm } from "@/components/office/inventory/price-lists/price-list-views";
import { api } from "@/lib/api-client";

type CurrencyOption = { code: string; name: string; symbol: string };

export default async function NewPriceListPage() {
  const currencies = await api.get<CurrencyOption[]>("/price-lists/currency-options");

  return (
    <PriceListForm
      mode="new"
      defaultValues={{ name: "", currencyCode: "IDR", priceType: "markup", percentage: "0" }}
      currencies={currencies}
    />
  );
}
