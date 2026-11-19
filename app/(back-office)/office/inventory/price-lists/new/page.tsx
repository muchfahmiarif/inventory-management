import { asc } from "drizzle-orm";

import { PriceListForm } from "@/components/office/inventory/price-lists/price-list-views";
import { db } from "@/db";
import { currencies } from "@/db/schema";

export default async function NewPriceListPage() {
  const currencyRows = await db
    .select({ code: currencies.code, name: currencies.name, symbol: currencies.symbol })
    .from(currencies)
    .orderBy(asc(currencies.code));

  return (
    <PriceListForm
      mode="new"
      defaultValues={{ name: "", currencyCode: "IDR", priceType: "markup", percentage: "0" }}
      currencies={currencyRows}
    />
  );
}
