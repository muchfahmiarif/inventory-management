import { asc } from "drizzle-orm";

import { TemplatesClient } from "@/components/office/settings/templates-client";
import { db } from "@/db";
import { templates } from "@/db/schema";

export default async function TemplatesSettingsPage() {
  const rows = await db.select().from(templates).orderBy(asc(templates.name));

  return (
    <TemplatesClient
      rows={rows.map((r) => ({
        id: r.id,
        name: r.name,
        type: r.type,
        subject: r.subject ?? "",
        body: r.body ?? "",
      }))}
    />
  );
}
