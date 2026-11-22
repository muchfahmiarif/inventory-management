import { notFound } from "next/navigation";

import { ContactForm, type ContactFormValues } from "@/components/office/contacts/contact-views";
import { ApiError, api } from "@/lib/api-client";

type ContactData = {
  id: string;
  type: "customer" | "vendor";
  displayName: string;
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  website: string | null;
  billingAddressLine1: string | null;
  billingCity: string | null;
  billingState: string | null;
  billingZip: string | null;
  billingCountry: string | null;
  shippingAddressLine1: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingZip: string | null;
  shippingCountry: string | null;
  taxNumber: string | null;
  currencyCode: string | null;
  notes: string | null;
};

export default async function EditVendorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let c: ContactData;
  try {
    c = await api.get<ContactData>(`/contacts/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
  if (c.type !== "vendor") notFound();

  const defaults: ContactFormValues = {
    displayName: c.displayName,
    firstName: c.firstName ?? undefined,
    lastName: c.lastName ?? undefined,
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
