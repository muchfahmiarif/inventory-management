"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { api } from "@/lib/api-client";
import {
  transferFormSchema,
  type TransferFormInput,
} from "@/lib/schemas/transfers";

const PATH = "/office/transfers";

// Thin proxies to the Go backend (status transitions post ledger movements in Go).

export async function createTransfer(input: TransferFormInput) {
  const parsed = transferFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  if (parsed.data.fromWarehouseId === parsed.data.toWarehouseId) {
    return {
      ok: false as const,
      errors: { fromWarehouseId: ["Source and destination must differ"] },
    };
  }
  const { id } = await api.post<{ id: string }>("/transfers", parsed.data);
  revalidatePath(PATH);
  redirect(`${PATH}/${id}`);
}

export async function markTransferShipped(id: string) {
  await api.post(`/transfers/${id}/ship`);
  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
}

export async function markTransferReceived(id: string) {
  await api.post(`/transfers/${id}/receive`);
  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
}

export async function deleteTransfer(id: string) {
  // Go reverses movements if the transfer was shipped.
  await api.delete(`/transfers/${id}`);
  revalidatePath(PATH);
  redirect(PATH);
}

export async function deleteTransfers(ids: string[]) {
  if (!ids.length) return;
  // Go only deletes drafts; shipped ones must be reversed individually.
  await api.post("/transfers/bulk-delete", { ids });
  revalidatePath(PATH);
}
