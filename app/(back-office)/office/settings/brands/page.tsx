import { asc } from "drizzle-orm";

import { EntityManager } from "@/components/office/settings/entity-manager";
import { api } from "@/lib/api-client";

const columns: Array<{ key: string; header: string; money?: boolean }> = [{ key: "name", header: "Name" }, { key: "description", header: "Description" }];

const fields: Array<{ key: string; label: string; type?: "number"; required?: boolean }> = [{ key: "name", label: "Name", required: true }, { key: "description", label: "Description" }];

export default async function BrandsSettingsPage() {
  const rows = await api.get<Record<string, unknown>[]>("/settings/brands");

  return (
    <EntityManager
      config={{
        slug: "brands",
        title: "Brands",
        entityLabel: "Brand",
        idKey: "id",
        columns,
        fields,
      }}
      rows={rows}
    />
  );
}
