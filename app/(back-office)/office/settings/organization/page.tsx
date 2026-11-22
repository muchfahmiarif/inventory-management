import { OrganizationForm } from "@/components/office/settings/organization-form";
import { api } from "@/lib/api-client";

type OrganizationSettings = {
  organization: Record<string, string | null> | null;
  currencies: { code: string; name: string }[];
};

export default async function OrganizationSettingsPage() {
  const { organization, currencies } = await api.get<OrganizationSettings>("/settings/organization");
  const org = organization ?? {};

  return (
    <OrganizationForm
      defaults={{
        name: org.name ?? "",
        legalName: org.legalName ?? "",
        addressLine1: org.addressLine1 ?? "",
        city: org.city ?? "",
        state: org.state ?? "",
        zip: org.zip ?? "",
        country: org.country ?? "",
        phone: org.phone ?? "",
        email: org.email ?? "",
        website: org.website ?? "",
        taxId: org.taxId ?? "",
        currencyCode: org.currencyCode ?? "IDR",
        timezone: org.timezone ?? "Asia/Jakarta",
      }}
      currencies={currencies}
    />
  );
}
