import { asc } from "drizzle-orm";

import { EntityManager } from "@/components/office/settings/entity-manager";
import { api } from "@/lib/api-client";

const columns: Array<{ key: string; header: string; money?: boolean }> = [{ key: "name", header: "Name" }, { key: "description", header: "Description" }];

const fields: Array<{ key: string; label: string; type?: "number"; required?: boolean }> = [{ key: "name", label: "Name", required: true }, { key: "description", label: "Description" }];

export default async function CategoriesSettingsPage() {
  const rows = await api.get<Record<string, unknown>[]>("/settings/categories");

  return (
    <EntityManager
      config={{
        slug: "categories",
        title: "Categories",
        entityLabel: "Category",
        idKey: "id",
        columns,
        fields,
      }}
      rows={rows}
    />
  );
}
