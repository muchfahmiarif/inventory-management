import { asc } from "drizzle-orm";

import { EntityManager } from "@/components/office/settings/entity-manager";
import { api } from "@/lib/api-client";

const columns: Array<{ key: string; header: string; money?: boolean }> = [{ key: "name", header: "Name" }, { key: "description", header: "Description" }];

const fields: Array<{ key: string; label: string; type?: "number"; required?: boolean }> = [{ key: "name", label: "Name", required: true }, { key: "description", label: "Description" }];

export default async function UnitsSettingsPage() {
  const rows = await api.get<Record<string, unknown>[]>("/settings/units");

  return (
    <EntityManager
      config={{
        slug: "units",
        title: "Units",
        entityLabel: "Unit",
        idKey: "id",
        columns,
        fields,
      }}
      rows={rows}
    />
  );
}
