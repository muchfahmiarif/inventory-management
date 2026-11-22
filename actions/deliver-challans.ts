"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { api } from "@/lib/api-client";
import {
  transactionFormSchema,
  type TransactionFormInput,
} from "@/lib/schemas/transactions";

const PATH = "/office/sales/deliver-challans";

// Thin proxies to the Go backend.

export async function createDeliverChallan(input: TransactionFormInput) {
  const parsed = transactionFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const { id } = await api.post<{ id: string }>("/deliver-challans", parsed.data);
  revalidatePath(PATH);
  redirect(`${PATH}/${id}`);
}

export async function setDeliverChallanStatus(
  id: string,
  status: "draft" | "sent" | "invoiced" | "cancelled",
) {
  await api.patch(`/deliver-challans/${id}/status`, { status });
  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
}

export async function deleteDeliverChallan(id: string) {
  await api.delete(`/deliver-challans/${id}`);
  revalidatePath(PATH);
  redirect(PATH);
}

export async function deleteDeliverChallans(ids: string[]) {
  if (!ids.length) return;
  await api.post("/deliver-challans/bulk-delete", { ids });
  revalidatePath(PATH);
}
