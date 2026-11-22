"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { api } from "@/lib/api-client";

const PATH = "/office/inventory/price-lists";

const optionalNumber = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number().nonnegative().optional(),
);

export const priceListFormSchema = z.object({
  name: z.string().min(1, "Price List Name is required"),
  description: z.string().optional(),
  currencyCode: z.string().min(1, "Select a currency"),
  priceType: z.enum(["markup", "markdown"]),
  percentage: optionalNumber,
});

export type PriceListFormInput = z.infer<typeof priceListFormSchema>;

// Thin proxies to the Go backend; signatures match the original actions.

export async function createPriceList(input: PriceListFormInput) {
  const parsed = priceListFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const { id } = await api.post<{ id: string }>("/price-lists", parsed.data);
  revalidatePath(PATH);
  redirect(`${PATH}/${id}`);
}

export async function updatePriceList(id: string, input: PriceListFormInput) {
  const parsed = priceListFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  await api.patch(`/price-lists/${id}`, parsed.data);
  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
  redirect(`${PATH}/${id}`);
}

export async function deletePriceList(id: string) {
  await api.delete(`/price-lists/${id}`);
  revalidatePath(PATH);
  redirect(PATH);
}

export async function deletePriceLists(ids: string[]) {
  if (!ids.length) return;
  await api.post("/price-lists/bulk-delete", { ids });
  revalidatePath(PATH);
}
