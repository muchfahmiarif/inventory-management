import { notFound } from "next/navigation";

import { ContactDetail } from "@/components/office/contacts/contact-views";
import { ApiError, api } from "@/lib/api-client";

type ContactData = {
  id: string;
  type: "customer" | "vendor";
  displayName: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  website: string | null;
  status: "active" | "inactive";
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
  notes: string | null;
};

export default async function VendorDetailDetailPage({
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

  return <ContactDetail data={c} />;
}
