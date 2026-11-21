import { asc } from "drizzle-orm";

import { EntityManager } from "@/components/office/settings/entity-manager";
import { db } from "@/db";
import { categories } from "@/db/schema";

const columns: Array<{ key: string; header: string; money?: boolean }> = [{ key: "name", header: "Name" }, { key: "description", header: "Description" }];

const fields: Array<{ key: string; label: string; type?: "number"; required?: boolean }> = [{ key: "name", label: "Name", required: true }, { key: "description", label: "Description" }];

export default async function CategoriesSettingsPage() {
  const rows = await db.select().from(categories).orderBy(asc(categories.name));

  return (
    <EntityManager
      config={{
        slug: "categories",
        title: "Categories",
        entityLabel: "Category",
        idKey: "name",
        columns,
        fields,
      }}
      rows={rows}
    />
  );
}
