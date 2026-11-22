import { PreferencesClient } from "@/components/office/settings/preferences-client";
import { api } from "@/lib/api-client";

type FlagRow = { key: string; value: boolean };

export default async function PreferencesSettingsPage() {
  const flags = await api.get<FlagRow[]>("/settings/flags");

  return <PreferencesClient flags={flags} />;
}
