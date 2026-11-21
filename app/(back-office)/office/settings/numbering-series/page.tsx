import { asc } from "drizzle-orm";

import { NumberingSeriesClient } from "@/components/office/settings/numbering-series-client";
import { db } from "@/db";
import { numberingSeries } from "@/db/schema";

export default async function NumberingSeriesPage() {
  const rows = await db
    .select()
    .from(numberingSeries)
    .orderBy(asc(numberingSeries.module));

  return (
    <NumberingSeriesClient
      rows={rows.map((r) => ({
        module: r.module,
        prefix: r.prefix,
        nextNumber: r.nextNumber,
        padding: r.padding,
      }))}
    />
  );
}
