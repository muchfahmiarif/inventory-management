"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { api } from "@/lib/api-client";

const PATH = "/office/sales/shipments";

const shipmentFormSchema = z.object({
  packageId: z.string().min(1, "Select a package"),
  date: z.string().min(1, "Date is required"),
  carrier: z.string().optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
});

export type ShipmentFormInput = z.infer<typeof shipmentFormSchema>;

// Thin proxies to the Go backend (stock-out postings happen there).

export async function createShipment(input: ShipmentFormInput) {
  const parsed = shipmentFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const { id } = await api.post<{ id: string }>("/shipments", parsed.data);
  revalidatePath(PATH);
  revalidatePath("/office/sales/packages");
  revalidatePath("/office/sales/sales-orders");
  redirect(`${PATH}/${id}`);
}

export async function markShipmentDelivered(id: string) {
  await api.post(`/shipments/${id}/deliver`);
  revalidatePath(PATH);
  revalidatePath("/office/sales/packages");
  revalidatePath("/office/sales/sales-orders");
}

export async function deleteShipment(id: string) {
  // Go reverses the stock-out before deleting.
  await api.delete(`/shipments/${id}`);
  revalidatePath(PATH);
  revalidatePath("/office/sales/packages");
  redirect(PATH);
}
