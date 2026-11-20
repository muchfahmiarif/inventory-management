import { asc, eq } from "drizzle-orm";

import { ContactsList } from "@/components/office/contacts/contact-views";
import { db } from "@/db";
import { contacts } from "@/db/schema";

export default async function VendorsPage() {
  const data = await db
    .select({
      id: contacts.id,
      displayName: contacts.displayName,
      companyName: contacts.companyName,
      email: contacts.email,
      phone: contacts.phone,
      status: contacts.status,
    })
    .from(contacts)
    .where(eq(contacts.type, "vendor"))
    .orderBy(asc(contacts.displayName));

  return <ContactsList data={data} basePath="/office/purchases/vendors" label="Vendor" title="Vendors" />;
}
