import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { ShipmentDetail } from "@/components/office/transactions/package-shipment-views";
import { db } from "@/db";
import { contacts, shipmentLines, shipments } from "@/db/schema";

export default async function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [shipment] = await db
    .select({
      id: shipments.id,
      number: shipments.number,
      date: shipments.date,
      status: shipments.status,
      carrier: shipments.carrier,
      trackingNumber: shipments.trackingNumber,
      notes: shipments.notes,
      customerName: contacts.displayName,
    })
    .from(shipments)
    .leftJoin(contacts, eq(shipments.contactId, contacts.id))
    .where(eq(shipments.id, id));

  if (!shipment) notFound();

  const lines = await db
    .select({
      id: shipmentLines.id,
      itemName: shipmentLines.name,
      quantity: shipmentLines.quantity,
    })
    .from(shipmentLines)
    .where(eq(shipmentLines.shipmentId, id))
    .orderBy(asc(shipmentLines.id));

  return (
    <ShipmentDetail
      data={{
        ...shipment,
        customerName: shipment.customerName ?? "Unknown",
        lines: lines.map((l) => ({
          ...l,
          quantity: Number(l.quantity),
        })),
      }}
    />
  );
}
