import { desc, eq, sql } from "drizzle-orm";

import ItemsList from "@/components/office/inventory/items/items-list";
import { db } from "@/db";
import { itemGroups, items, stockMovements, units } from "@/db/schema";

const VIEW_NAMES: Record<string, string> = {
  all: "All Items",
  active: "Active Items",
  ungrouped: "Ungrouped Items",
  "low-stock": "Low Stock Items",
  sales: "Sales",
  purchases: "Purchases",
  inventory: "Inventory Items",
  "non-inventory": "Non Inventory Items",
  services: "Services",
  inactive: "Inactive Items",
  returned: "Returned Items",
  "non-returned": "Non Returned Items",
};

export default async function InventoryItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view = "all" } = await searchParams;

  const rows = await db
    .select({
      id: items.id,
      name: items.name,
      sku: items.sku,
      type: items.type,
      status: items.status,
      costPrice: items.costPrice,
      sellingPrice: items.sellingPrice,
      reorderLevel: items.reorderLevel,
      groupId: items.groupId,
      groupName: itemGroups.name,
      unitName: units.name,
    })
    .from(items)
    .leftJoin(itemGroups, eq(items.groupId, itemGroups.id))
    .leftJoin(units, eq(items.unitId, units.id))
    .orderBy(desc(items.createdAt));

  // Stock on hand per item, from the single movements ledger
  const stockRows = await db
    .select({
      itemId: stockMovements.itemId,
      total: sql<number>`coalesce(sum(${stockMovements.quantity}), 0)::float8`,
    })
    .from(stockMovements)
    .groupBy(stockMovements.itemId);
  const stockByItem = new Map(stockRows.map((r) => [r.itemId, r.total]));

  const data = rows
    .map((r) => ({ ...r, stockOnHand: stockByItem.get(r.id) ?? 0 }))
    .filter((row) => {
      switch (view) {
        case "active":
          return row.status === "active";
        case "inactive":
          return row.status === "inactive";
        case "ungrouped":
          return !row.groupId;
        case "low-stock":
          return (
            row.type === "inventory" &&
            row.reorderLevel !== null &&
            row.stockOnHand <= row.reorderLevel
          );
        case "inventory":
          return row.type === "inventory";
        case "non-inventory":
          return row.type === "non_inventory";
        case "services":
          return row.type === "service";
        // Views that depend on transactions (none recorded yet)
        case "sales":
        case "purchases":
        case "returned":
        case "non-returned":
          return false;
        default:
          return true;
      }
    });

  return <ItemsList data={data} view={view} title={VIEW_NAMES[view] ?? "All Items"} />;
}
