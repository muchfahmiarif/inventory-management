import { eq } from "drizzle-orm";

import { OrganizationForm } from "@/components/office/settings/organization-form";
import { db } from "@/db";
import { currencies, organization } from "@/db/schema";

export default async function OrganizationSettingsPage() {
  const [org] = await db.select().from(organization).limit(1);
  const currencyRows = await db
    .select({ code: currencies.code, name: currencies.name })
    .from(currencies);

  return (
    <OrganizationForm
      defaults={{
        name: org?.name ?? "",
        legalName: org?.legalName ?? "",
        addressLine1: org?.addressLine1 ?? "",
        city: org?.city ?? "",
        state: org?.state ?? "",
        zip: org?.zip ?? "",
        country: org?.country ?? "",
        phone: org?.phone ?? "",
        email: org?.email ?? "",
        website: org?.website ?? "",
        taxId: org?.taxId ?? "",
        currencyCode: org?.currencyCode ?? "IDR",
        timezone: org?.timezone ?? "Asia/Jakarta",
      }}
      currencies={currencyRows}
    />
  );
}
