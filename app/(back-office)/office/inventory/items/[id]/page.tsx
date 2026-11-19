import { asc, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import ItemDetail from "@/components/office/inventory/items/item-detail";
import { db } from "@/db";
import {
  activityLog,
  brands,
  categories,
  contacts,
  itemGroups,
  items,
  stockMovements,
  taxes,
  units,
  warehouses,
} from "@/db/schema";

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [row] = await db
    .select({
      id: items.id,
      name: items.name,
      sku: items.sku,
      type: items.type,
      status: items.status,
      description: items.description,
      costPrice: items.costPrice,
      sellingPrice: items.sellingPrice,
      wholesalePrice: items.wholesalePrice,
      reorderLevel: items.reorderLevel,
      groupName: itemGroups.name,
      unitName: units.name,
      brandName: brands.name,
      categoryName: categories.name,
      taxName: taxes.name,
      taxRate: taxes.rate,
      vendorName: contacts.displayName,
    })
    .from(items)
    .leftJoin(itemGroups, eq(items.groupId, itemGroups.id))
    .leftJoin(units, eq(items.unitId, units.id))
    .leftJoin(brands, eq(items.brandId, brands.id))
    .leftJoin(categories, eq(items.categoryId, categories.id))
    .leftJoin(taxes, eq(items.taxId, taxes.id))
    .leftJoin(contacts, eq(items.preferredVendorId, contacts.id))
    .where(eq(items.id, id));

  if (!row) notFound();

  const movements = await db
    .select({
      id: stockMovements.id,
      createdAt: stockMovements.createdAt,
      sourceType: stockMovements.sourceType,
      sourceNumber: stockMovements.sourceNumber,
      warehouseName: warehouses.name,
      quantity: stockMovements.quantity,
    })
    .from(stockMovements)
    .leftJoin(warehouses, eq(stockMovements.warehouseId, warehouses.id))
    .where(eq(stockMovements.itemId, id))
    .orderBy(asc(stockMovements.createdAt));

  const history = await db
    .select({
      id: activityLog.id,
      action: activityLog.action,
      createdAt: activityLog.createdAt,
    })
    .from(activityLog)
    .where(eq(activityLog.entityType, "item"))
    .orderBy(desc(activityLog.createdAt));

  const stockOnHand = movements.reduce((sum, m) => sum + Number(m.quantity), 0);

  return (
    <ItemDetail
      data={{
        ...row,
        stockOnHand,
        movements: movements.map((m) => ({
          id: m.id,
          createdAt: m.createdAt.toISOString(),
          sourceType: m.sourceType,
          sourceNumber: m.sourceNumber,
          warehouseName: m.warehouseName,
          quantity: Number(m.quantity),
        })),
        history: history.map((h) => ({
          id: h.id,
          action: h.action,
          createdAt: h.createdAt.toISOString(),
        })),
      }}
    />
  );
}
