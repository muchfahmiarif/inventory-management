import { TemplatesClient } from "@/components/office/settings/templates-client";
import { api } from "@/lib/api-client";

type TemplateRow = { id: string; name: string; type: string; subject: string; body: string };

export default async function TemplatesSettingsPage() {
  const rows = await api.get<TemplateRow[]>("/settings/templates");

  return <TemplatesClient rows={rows} />;
}
