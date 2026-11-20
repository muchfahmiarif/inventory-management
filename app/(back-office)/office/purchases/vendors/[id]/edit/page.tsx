import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { ContactForm } from "@/components/office/contacts/contact-views";
import type { ContactFormValues } from "@/components/office/contacts/contact-views";
import { db } from "@/db";
import { contacts } from "@/db/schema";

export default async function EditVendorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [c] = await db.select().from(contacts).where(eq(contacts.id, id));
  if (!c || c.type !== "vendor") notFound();

  const defaults: ContactFormValues = {
    displayName: c.displayName,
    companyName: c.companyName ?? undefined,
    email: c.email ?? undefined,
    phone: c.phone ?? undefined,
    mobile: c.mobile ?? undefined,
    website: c.website ?? undefined,
    billingAddressLine1: c.billingAddressLine1 ?? undefined,
    billingCity: c.billingCity ?? undefined,
    billingState: c.billingState ?? undefined,
    billingZip: c.billingZip ?? undefined,
    billingCountry: c.billingCountry ?? undefined,
    shippingAddressLine1: c.shippingAddressLine1 ?? undefined,
    shippingCity: c.shippingCity ?? undefined,
    shippingState: c.shippingState ?? undefined,
    shippingZip: c.shippingZip ?? undefined,
    shippingCountry: c.shippingCountry ?? undefined,
    taxNumber: c.taxNumber ?? undefined,
    currencyCode: c.currencyCode ?? undefined,
    notes: c.notes ?? undefined,
  };

  return (
    <ContactForm mode="edit" contactId={c.id} contactType="vendor" defaultValues={defaults} />
  );
}
