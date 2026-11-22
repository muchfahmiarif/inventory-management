"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { api } from "@/lib/api-client";
import { contactFormSchema, type ContactFormInput } from "@/lib/schemas/contacts";

type ContactType = "customer" | "vendor";

// Thin proxies to the Go backend; signatures match the original actions.

function pathsFor(type: ContactType) {
  return type === "customer" ? "/office/sales/customers" : "/office/purchases/vendors";
}

export async function createContact(
  type: ContactType,
  input: ContactFormInput,
) {
  const parsed = contactFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const { id } = await api.post<{ id: string }>("/contacts", {
    type,
    ...parsed.data,
  });
  revalidatePath("/office/sales/customers");
  revalidatePath("/office/purchases/vendors");
  redirect(pathsFor(type));
}

export async function updateContact(id: string, input: ContactFormInput) {
  const parsed = contactFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const { type } = await api.patch<{ type: ContactType }>(`/contacts/${id}`, parsed.data);
  revalidatePath("/office/sales/customers");
  revalidatePath("/office/purchases/vendors");
  redirect(`${pathsFor(type)}/${id}`);
}

export async function deleteContact(id: string) {
  const { type } = await api.delete<{ type: ContactType }>(`/contacts/${id}`);
  revalidatePath("/office/sales/customers");
  revalidatePath("/office/purchases/vendors");
  redirect(pathsFor(type));
}

export async function toggleContactStatus(id: string, status: "active" | "inactive") {
  await api.patch(`/contacts/${id}/status`, { status });
  revalidatePath("/office/sales/customers");
  revalidatePath("/office/purchases/vendors");
}

export async function deleteContacts(ids: string[]) {
  if (!ids.length) return;
  await api.post("/contacts/bulk-delete", { ids });
  revalidatePath("/office/sales/customers");
  revalidatePath("/office/purchases/vendors");
}
