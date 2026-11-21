import { desc, eq } from "drizzle-orm";

import { PackagesList } from "@/components/office/transactions/package-shipment-views";
import { db } from "@/db";
import { contacts, packages, salesOrders } from "@/db/schema";

export default async function PackagesPage() {
  const rows = await db
    .select({
      id: packages.id,
      number: packages.number,
      date: packages.date,
      status: packages.status,
      customerName: contacts.displayName,
      salesOrderNumber: salesOrders.number,
    })
    .from(packages)
    .leftJoin(contacts, eq(packages.contactId, contacts.id))
    .leftJoin(salesOrders, eq(packages.salesOrderId, salesOrders.id))
    .orderBy(desc(packages.date), desc(packages.createdAt));

  return <PackagesList data={rows} title="Packages" />;
}
