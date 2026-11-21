import { asc } from "drizzle-orm";

import { EntityManager } from "@/components/office/settings/entity-manager";
import { db } from "@/db";
import { currencies } from "@/db/schema";

const columns: Array<{ key: string; header: string; money?: boolean }> = [{ key: "code", header: "Code" }, { key: "name", header: "Name" }, { key: "symbol", header: "Symbol" }, { key: "exchangeRate", header: "Exchange Rate", money: true }];

const fields: Array<{ key: string; label: string; type?: "number"; required?: boolean }> = [{ key: "code", label: "Code", required: true }, { key: "name", label: "Name", required: true }, { key: "symbol", label: "Symbol", required: true }, { key: "exchangeRate", label: "Exchange Rate", type: "number", required: true }];

export default async function CurrenciesSettingsPage() {
  const rows = await db.select().from(currencies).orderBy(asc(currencies.code));

  return (
    <EntityManager
      config={{
        slug: "currencies",
        title: "Currencies",
        entityLabel: "Currency",
        idKey: "code",
        columns,
        fields,
      }}
      rows={rows}
    />
  );
}
