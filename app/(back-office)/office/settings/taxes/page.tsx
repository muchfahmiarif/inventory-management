import { asc } from "drizzle-orm";

import { EntityManager } from "@/components/office/settings/entity-manager";
import { db } from "@/db";
import { taxes } from "@/db/schema";

const columns: Array<{ key: string; header: string; money?: boolean }> = [{ key: "name", header: "Name" }, { key: "rate", header: "Rate (%)", money: false }];

const fields: Array<{ key: string; label: string; type?: "number"; required?: boolean }> = [{ key: "name", label: "Name", required: true }, { key: "rate", label: "Rate (%)", type: "number", required: true }];

export default async function TaxesSettingsPage() {
  const rows = await db.select().from(taxes).orderBy(asc(taxes.name));

  return (
    <EntityManager
      config={{
        slug: "taxes",
        title: "Taxes",
        entityLabel: "Tax",
        idKey: "name",
        columns,
        fields,
      }}
      rows={rows}
    />
  );
}
