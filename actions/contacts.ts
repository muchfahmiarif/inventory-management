"use server";

import { inArray, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import { contacts } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { contactFormSchema, type ContactFormInput } from "@/lib/schemas/contacts";

type ContactType = "customer" | "vendor";

function nullable(value?: string) {
  return value && value.length > 0 ? value : null;
}

function toValues(data: z.output<typeof contactFormSchema>) {
  return {
    displayName: data.displayName,
    firstName: nullable(data.firstName),
    lastName: nullable(data.lastName),
    companyName: nullable(data.companyName),
    email: nullable(data.email),
    phone: nullable(data.phone),
    mobile: nullable(data.mobile),
    website: nullable(data.website),
    billingAddressLine1: nullable(data.billingAddressLine1),
    billingCity: nullable(data.billingCity),
    billingState: nullable(data.billingState),
    billingZip: nullable(data.billingZip),
    billingCountry: nullable(data.billingCountry),
    shippingAddressLine1: nullable(data.shippingAddressLine1),
    shippingCity: nullable(data.shippingCity),
    shippingState: nullable(data.shippingState),
    shippingZip: nullable(data.shippingZip),
    shippingCountry: nullable(data.shippingCountry),
    taxNumber: nullable(data.taxNumber),
    currencyCode: nullable(data.currencyCode),
    notes: nullable(data.notes),
    updatedAt: new Date(),
  };
}

export async function createContact(
  type: ContactType,
  input: ContactFormInput,
) {
  const parsed = contactFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const data = parsed.data;

  const id = await db.transaction(async (tx) => {
    // Zoho doesn't auto-number contacts; the series stays reserved
    const [contact] = await tx
      .insert(contacts)
      .values({
        type,
        ...toValues(data),
      })
      .returning();
    return contact.id;
  });

  await logActivity({
    action: `created ${type}`,
    entityType: "contact",
    entityId: id,
    entityLabel: data.displayName,
  });

  revalidatePath(type === "customer" ? "/office/sales/customers" : "/office/purchases/vendors");
  redirect(type === "customer" ? "/office/sales/customers" : "/office/purchases/vendors");
}

export async function updateContact(id: string, input: ContactFormInput) {
  const parsed = contactFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const data = parsed.data;

  const [contact] = await db
    .update(contacts)
    .set(toValues(data))
    .where(eq(contacts.id, id))
    .returning();

  await logActivity({
    action: "updated contact",
    entityType: "contact",
    entityId: id,
    entityLabel: data.displayName,
  });

  const path =
    contact.type === "customer"
      ? `/office/sales/customers/${id}`
      : `/office/purchases/vendors/${id}`;
  revalidatePath(path);
  redirect(path);
}

export async function deleteContact(id: string) {
  const [contact] = await db
    .delete(contacts)
    .where(eq(contacts.id, id))
    .returning();
  if (contact) {
    await logActivity({
      action: "deleted contact",
      entityType: "contact",
      entityId: id,
      entityLabel: contact.displayName,
    });
  }
  revalidatePath("/office/sales/customers");
  revalidatePath("/office/purchases/vendors");
  redirect(contact?.type === "vendor" ? "/office/purchases/vendors" : "/office/sales/customers");
}

export async function toggleContactStatus(id: string, status: "active" | "inactive") {
  await db
    .update(contacts)
    .set({ status, updatedAt: new Date() })
    .where(eq(contacts.id, id));
  revalidatePath("/office/sales/customers");
  revalidatePath("/office/purchases/vendors");
}

export async function deleteContacts(ids: string[]) {
  if (!ids.length) return;
  await db.delete(contacts).where(inArray(contacts.id, ids));
  revalidatePath("/office/sales/customers");
  revalidatePath("/office/purchases/vendors");
}
