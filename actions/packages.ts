"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { api } from "@/lib/api-client";

const PATH = "/office/sales/packages";

const optionalNumber = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number().positive().optional(),
);

const packageFormSchema = z.object({
  date: z.string().min(1, "Date is required"),
  salesOrderId: z.string().min(1, "Select a sales order"),
  warehouseId: z.string().min(1, "Select a warehouse"),
  notes: z.string().optional(),
  lines: z
    .array(
      z.object({
        itemId: z.string().min(1),
        quantity: optionalNumber,
      }),
    )
    .min(1, "Pack at least one item"),
});

export type PackageFormInput = z.infer<typeof packageFormSchema>;

// Thin proxies to the Go backend (pack validation + SO status happen there).

export async function createPackage(input: PackageFormInput) {
  const parsed = packageFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const { id } = await api.post<{ id: string }>("/packages", parsed.data);
  revalidatePath(PATH);
  revalidatePath("/office/sales/sales-orders");
  redirect(`${PATH}/${id}`);
}

export async function deletePackage(id: string) {
  await api.delete(`/packages/${id}`);
  revalidatePath(PATH);
  redirect(PATH);
}

export async function deletePackages(ids: string[]) {
  if (!ids.length) return;
  await api.post("/packages/bulk-delete", { ids });
  revalidatePath(PATH);
}
