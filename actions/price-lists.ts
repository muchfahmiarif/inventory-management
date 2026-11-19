"use server";

import { asc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import { priceListItems, priceLists } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { nextNumber } from "@/lib/numbering";

const PATH = "/office/inventory/price-lists";

const optionalNumber = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number().nonnegative().optional(),
);

const priceListFormSchema = z.object({
  name: z.string().min(1, "Price List Name is required"),
  description: z.string().optional(),
  currencyCode: z.string().min(1, "Select a currency"),
  priceType: z.enum(["markup", "markdown"]),
  percentage: optionalNumber,
});

export type PriceListFormInput = z.infer<typeof priceListFormSchema>;

export async function createPriceList(input: PriceListFormInput) {
  const parsed = priceListFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const data = parsed.data;

  const id = await db.transaction(async (tx) => {
    const [list] = await tx
      .insert(priceLists)
      .values({
        name: data.name,
        description: data.description || null,
        currencyCode: data.currencyCode,
        priceType: data.priceType,
        percentage: data.percentage ?? 0,
      })
      .returning();
    return list.id;
  });

  await logActivity({
    action: "created price list",
    entityType: "price_list",
    entityId: id,
    entityLabel: data.name,
  });

  revalidatePath(PATH);
  redirect(`${PATH}/${id}`);
}

export async function updatePriceList(id: string, input: PriceListFormInput) {
  const parsed = priceListFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const data = parsed.data;

  await db
    .update(priceLists)
    .set({
      name: data.name,
      description: data.description || null,
      currencyCode: data.currencyCode,
      priceType: data.priceType,
      percentage: data.percentage ?? 0,
      updatedAt: new Date(),
    })
    .where(eq(priceLists.id, id));

  await logActivity({
    action: "updated price list",
    entityType: "price_list",
    entityId: id,
    entityLabel: data.name,
  });

  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
  redirect(`${PATH}/${id}`);
}

export async function deletePriceList(id: string) {
  await db.delete(priceLists).where(eq(priceLists.id, id));
  await logActivity({
    action: "deleted price list",
    entityType: "price_list",
    entityId: id,
  });
  revalidatePath(PATH);
  redirect(PATH);
}

export async function deletePriceLists(ids: string[]) {
  if (!ids.length) return;
  await db.delete(priceLists).where(inArray(priceLists.id, ids));
  revalidatePath(PATH);
}
