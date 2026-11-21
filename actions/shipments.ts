"use server";

import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import {
  packages,
  packageLines,
  salesOrders,
  shipments,
  shipmentLines,
  stockMovements,
} from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { nextNumber } from "@/lib/numbering";

const PATH = "/office/sales/shipments";

const shipmentFormSchema = z.object({
  packageId: z.string().min(1, "Select a package"),
  date: z.string().min(1, "Date is required"),
  carrier: z.string().optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
});

export type ShipmentFormInput = z.infer<typeof shipmentFormSchema>;

// Creating a shipment is the stock-out event: movements leave the package's
// warehouse for every packed quantity, the package becomes shipped, and the
// sales order advances to shipped.
export async function createShipment(input: ShipmentFormInput) {
  const parsed = shipmentFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const data = parsed.data;

  const id = await db.transaction(async (tx) => {
    const [pkg] = await tx
      .select()
      .from(packages)
      .where(eq(packages.id, data.packageId));
    if (!pkg) throw new Error("Package not found");
    if (pkg.status !== "draft") {
      throw new Error("Package has already been shipped");
    }
    if (!pkg.warehouseId) {
      throw new Error("Package has no warehouse set");
    }

    const pkgLines = await tx
      .select()
      .from(packageLines)
      .where(eq(packageLines.packageId, pkg.id));

    const number = await nextNumber(tx, "shipments");
    const [shipment] = await tx
      .insert(shipments)
      .values({
        number,
        date: data.date,
        contactId: pkg.contactId,
        salesOrderId: pkg.salesOrderId,
        packageId: pkg.id,
        carrier: data.carrier || null,
        trackingNumber: data.trackingNumber || null,
        notes: data.notes || null,
        status: "shipped",
      })
      .returning();

    await tx.insert(shipmentLines).values(
      pkgLines.map((l) => ({
        shipmentId: shipment.id,
        itemId: l.itemId,
        name: l.name,
        quantity: l.quantity,
        rate: l.rate,
        amount: l.amount,
      })),
    );

    // Stock-out from the package warehouse
    for (const line of pkgLines) {
      await tx.insert(stockMovements).values({
        itemId: line.itemId,
        warehouseId: pkg.warehouseId,
        quantity: -line.quantity,
        sourceType: "shipment",
        sourceId: shipment.id,
        sourceNumber: number,
      });
    }

    await tx
      .update(packages)
      .set({ status: "shipped", updatedAt: new Date() })
      .where(eq(packages.id, pkg.id));

    if (pkg.salesOrderId) {
      await tx
        .update(salesOrders)
        .set({ status: "shipped", updatedAt: new Date() })
        .where(eq(salesOrders.id, pkg.salesOrderId));
    }
    return shipment.id;
  });

  await logActivity({
    action: "created shipment (stock shipped out)",
    entityType: "shipment",
    entityId: id,
  });

  revalidatePath(PATH);
  revalidatePath("/office/sales/packages");
  revalidatePath("/office/sales/sales-orders");
  redirect(`${PATH}/${id}`);
}

export async function markShipmentDelivered(id: string) {
  const [shipment] = await db
    .select()
    .from(shipments)
    .where(eq(shipments.id, id));
  if (!shipment || shipment.status !== "shipped") return;

  await db.transaction(async (tx) => {
    await tx
      .update(shipments)
      .set({ status: "delivered", updatedAt: new Date() })
      .where(eq(shipments.id, id));
    if (shipment.packageId) {
      await tx
        .update(packages)
        .set({ status: "delivered", updatedAt: new Date() })
        .where(eq(packages.id, shipment.packageId));
    }
    if (shipment.salesOrderId) {
      await tx
        .update(salesOrders)
        .set({ status: "fulfilled", updatedAt: new Date() })
        .where(eq(salesOrders.id, shipment.salesOrderId));
    }
  });

  await logActivity({
    action: "marked shipment as delivered",
    entityType: "shipment",
    entityId: id,
    entityLabel: shipment.number,
  });

  revalidatePath(PATH);
  revalidatePath("/office/sales/packages");
  revalidatePath("/office/sales/sales-orders");
}

export async function deleteShipment(id: string) {
  // Reverse the stock-out if the shipment had happened
  await db.transaction(async (tx) => {
    const [shipment] = await tx
      .select()
      .from(shipments)
      .where(eq(shipments.id, id));
    if (shipment && shipment.status !== "draft") {
      const lines = await tx
        .select()
        .from(shipmentLines)
        .where(eq(shipmentLines.shipmentId, id));
      const [pkg] = shipment.packageId
        ? await tx.select().from(packages).where(eq(packages.id, shipment.packageId))
        : [undefined];
      const warehouseId = pkg?.warehouseId;
      if (warehouseId) {
        for (const line of lines) {
          await tx.insert(stockMovements).values({
            itemId: line.itemId,
            warehouseId,
            quantity: line.quantity, // give stock back
            sourceType: "shipment_reversal",
            sourceId: shipment.id,
            sourceNumber: shipment.number,
          });
        }
      }
      if (shipment.packageId) {
        await tx
          .update(packages)
          .set({ status: "draft", updatedAt: new Date() })
          .where(eq(packages.id, shipment.packageId));
      }
    }
    await tx.delete(shipments).where(eq(shipments.id, id));
  });

  await logActivity({
    action: "deleted shipment (stock reversed)",
    entityType: "shipment",
    entityId: id,
  });

  revalidatePath(PATH);
  revalidatePath("/office/sales/packages");
  redirect(PATH);
}
