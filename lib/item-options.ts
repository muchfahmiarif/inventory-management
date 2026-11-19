import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  brands,
  categories,
  contacts,
  itemGroups,
  taxes,
  units,
  warehouses,
} from "@/db/schema";

// Dropdown option sets for the item form (New/Edit pages)
export async function getItemFormOptions() {
  const [unitRows, brandRows, categoryRows, groupRows, taxRows, warehouseRows, vendorRows] =
    await Promise.all([
      db.select({ id: units.id, name: units.name }).from(units).orderBy(asc(units.name)),
      db.select({ id: brands.id, name: brands.name }).from(brands).orderBy(asc(brands.name)),
      db
        .select({ id: categories.id, name: categories.name })
        .from(categories)
        .orderBy(asc(categories.name)),
      db
        .select({ id: itemGroups.id, name: itemGroups.name })
        .from(itemGroups)
        .orderBy(asc(itemGroups.name)),
      db.select({ id: taxes.id, name: taxes.name }).from(taxes).orderBy(asc(taxes.name)),
      db
        .select({ id: warehouses.id, name: warehouses.name })
        .from(warehouses)
        .orderBy(asc(warehouses.name)),
      db
        .select({ id: contacts.id, name: contacts.displayName })
        .from(contacts)
        .where(eq(contacts.type, "vendor"))
        .orderBy(asc(contacts.displayName)),
    ]);

  return {
    units: unitRows,
    brands: brandRows,
    categories: categoryRows,
    groups: groupRows,
    taxes: taxRows,
    warehouses: warehouseRows,
    vendors: vendorRows,
  };
}
