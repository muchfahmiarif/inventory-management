import { asc } from "drizzle-orm";

import { EntityManager } from "@/components/office/settings/entity-manager";
import { db } from "@/db";
import { brands } from "@/db/schema";

const columns: Array<{ key: string; header: string; money?: boolean }> = [{ key: "name", header: "Name" }, { key: "description", header: "Description" }];

const fields: Array<{ key: string; label: string; type?: "number"; required?: boolean }> = [{ key: "name", label: "Name", required: true }, { key: "description", label: "Description" }];

export default async function BrandsSettingsPage() {
  const rows = await db.select().from(brands).orderBy(asc(brands.name));

  return (
    <EntityManager
      config={{
        slug: "brands",
        title: "Brands",
        entityLabel: "Brand",
        idKey: "name",
        columns,
        fields,
      }}
      rows={rows}
    />
  );
}
