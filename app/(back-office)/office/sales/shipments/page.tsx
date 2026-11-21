import { desc, eq } from "drizzle-orm";

import { ShipmentsList } from "@/components/office/transactions/package-shipment-views";
import { db } from "@/db";
import { contacts, shipments } from "@/db/schema";

export default async function ShipmentsPage() {
  const rows = await db
    .select({
      id: shipments.id,
      number: shipments.number,
      date: shipments.date,
      status: shipments.status,
      customerName: contacts.displayName,
      carrier: shipments.carrier,
      trackingNumber: shipments.trackingNumber,
    })
    .from(shipments)
    .leftJoin(contacts, eq(shipments.contactId, contacts.id))
    .orderBy(desc(shipments.date), desc(shipments.createdAt));

  return <ShipmentsList data={rows} title="Shipments" />;
}
