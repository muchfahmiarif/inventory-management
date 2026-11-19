import { asc, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { PriceListDetail } from "@/components/office/inventory/price-lists/price-list-views";
import { db } from "@/db";
import { activityLog, items, priceLists } from "@/db/schema";

export default async function PriceListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [list] = await db.select().from(priceLists).where(eq(priceLists.id, id));
  if (!list) notFound();

  const itemRows = await db
    .select({ id: items.id, name: items.name, sellingPrice: items.sellingPrice })
    .from(items)
    .orderBy(asc(items.name));

  const history = await db
    .select({
      id: activityLog.id,
      action: activityLog.action,
      createdAt: activityLog.createdAt,
    })
    .from(activityLog)
    .where(eq(activityLog.entityType, "price_list"))
    .orderBy(desc(activityLog.createdAt))
    .limit(20);
  void history;

  return (
    <PriceListDetail
      data={{
        id: list.id,
        name: list.name,
        description: list.description,
        currencyCode: list.currencyCode,
        priceType: list.priceType,
        percentage: list.percentage,
        items: itemRows,
      }}
    />
  );
}
