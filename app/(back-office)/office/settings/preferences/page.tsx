import { PreferencesClient } from "@/components/office/settings/preferences-client";
import { db } from "@/db";
import { orgFlags } from "@/db/schema";

export default async function PreferencesSettingsPage() {
  const rows = await db.select().from(orgFlags);

  return <PreferencesClient flags={rows.map((r) => ({ key: r.key, value: r.value }))} />;
}
