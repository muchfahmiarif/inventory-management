import { asc } from "drizzle-orm";

import { PriceListsList } from "@/components/office/inventory/price-lists/price-list-views";
import { db } from "@/db";
import { priceLists } from "@/db/schema";

export default async function PriceListsPage() {
  const data = await db
    .select({
      id: priceLists.id,
      name: priceLists.name,
      description: priceLists.description,
      currencyCode: priceLists.currencyCode,
      priceType: priceLists.priceType,
      percentage: priceLists.percentage,
    })
    .from(priceLists)
    .orderBy(asc(priceLists.name));

  return <PriceListsList data={data} title="All Price Lists" />;
}
