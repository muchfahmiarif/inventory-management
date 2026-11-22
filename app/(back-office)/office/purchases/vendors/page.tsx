import { ContactsList } from "@/components/office/contacts/contact-views";
import { api } from "@/lib/api-client";

type ContactRow = {
  id: string;
  displayName: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  status: "active" | "inactive";
};

export default async function VendorsPage() {
  const data = await api.get<ContactRow[]>("/contacts?type=vendor");

  return <ContactsList data={data} basePath="/office/purchases/vendors" label="Vendor" title="Vendors" />;
}
