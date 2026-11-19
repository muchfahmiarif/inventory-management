import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { PriceListForm } from "@/components/office/inventory/price-lists/price-list-views";
import { db } from "@/db";
import { currencies, priceLists } from "@/db/schema";

export default async function EditPriceListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [list] = await db.select().from(priceLists).where(eq(priceLists.id, id));
  if (!list) notFound();

  const currencyRows = await db
    .select({ code: currencies.code, name: currencies.name, symbol: currencies.symbol })
    .from(currencies)
    .orderBy(asc(currencies.code));

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
      currencies={currencyRows}
    />
  );
}
