import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { PackageDetail } from "@/components/office/transactions/package-shipment-views";
import { db } from "@/db";
import { contacts, packageLines, packages, salesOrders, warehouses } from "@/db/schema";

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [pkg] = await db
    .select({
      id: packages.id,
      number: packages.number,
      date: packages.date,
      status: packages.status,
      notes: packages.notes,
      customerName: contacts.displayName,
      salesOrderId: packages.salesOrderId,
      salesOrderNumber: salesOrders.number,
      warehouseName: warehouses.name,
    })
    .from(packages)
    .leftJoin(contacts, eq(packages.contactId, contacts.id))
    .leftJoin(salesOrders, eq(packages.salesOrderId, salesOrders.id))
    .leftJoin(warehouses, eq(packages.warehouseId, warehouses.id))
    .where(eq(packages.id, id));

  if (!pkg) notFound();

  const lines = await db
    .select({
      id: packageLines.id,
      itemName: packageLines.name,
      quantity: packageLines.quantity,
      rate: packageLines.rate,
      amount: packageLines.amount,
    })
    .from(packageLines)
    .where(eq(packageLines.packageId, id))
    .orderBy(asc(packageLines.id));

  return (
    <PackageDetail
      data={{
        ...pkg,
        customerName: pkg.customerName ?? "Unknown",
        lines: lines.map((l) => ({
          ...l,
          quantity: Number(l.quantity),
          rate: Number(l.rate),
          amount: Number(l.amount),
        })),
      }}
    />
  );
}
