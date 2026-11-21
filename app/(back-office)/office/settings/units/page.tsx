import { asc } from "drizzle-orm";

import { EntityManager } from "@/components/office/settings/entity-manager";
import { db } from "@/db";
import { units } from "@/db/schema";

const columns: Array<{ key: string; header: string; money?: boolean }> = [{ key: "name", header: "Name" }, { key: "description", header: "Description" }];

const fields: Array<{ key: string; label: string; type?: "number"; required?: boolean }> = [{ key: "name", label: "Name", required: true }, { key: "description", label: "Description" }];

export default async function UnitsSettingsPage() {
  const rows = await db.select().from(units).orderBy(asc(units.name));

  return (
    <EntityManager
      config={{
        slug: "units",
        title: "Units",
        entityLabel: "Unit",
        idKey: "name",
        columns,
        fields,
      }}
      rows={rows}
    />
  );
}
