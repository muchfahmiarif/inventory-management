import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { numberingSeries } from "@/db/schema";
import { formatNumber } from "@/lib/format";

type DbOrTx = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

// Atomically reserve the next number of a module's numbering series.
// Uses UPDATE ... RETURNING with an increment so concurrent creates can't
// collide on the unique `number` column.
export async function nextNumber(tx: DbOrTx, moduleName: string): Promise<string> {
  const [series] = await tx
    .update(numberingSeries)
    .set({ nextNumber: sql`${numberingSeries.nextNumber} + 1` })
    .where(eq(numberingSeries.module, moduleName))
    .returning();

  if (!series) {
    throw new Error(`No numbering series configured for module "${moduleName}"`);
  }

  // We incremented first; the number being consumed is the previous value
  return formatNumber(series.prefix, series.nextNumber - 1, series.padding);
}

// Non-transactional convenience wrapper
export async function peekNumber(moduleName: string): Promise<string> {
  const [series] = await db
    .select()
    .from(numberingSeries)
    .where(eq(numberingSeries.module, moduleName));
  if (!series) throw new Error(`No numbering series configured for module "${moduleName}"`);
  return formatNumber(series.prefix, series.nextNumber, series.padding);
}
