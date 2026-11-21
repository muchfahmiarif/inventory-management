"use server";

import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import { packages, packageLines, salesOrderLines, salesOrders } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { nextNumber } from "@/lib/numbering";

const PATH = "/office/sales/packages";

const optionalNumber = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number().positive().optional(),
);

const packageFormSchema = z.object({
  date: z.string().min(1, "Date is required"),
  salesOrderId: z.string().min(1, "Select a sales order"),
  warehouseId: z.string().min(1, "Select a warehouse"),
  notes: z.string().optional(),
  lines: z
    .array(
      z.object({
        itemId: z.string().min(1),
        quantity: optionalNumber,
      }),
    )
    .min(1, "Pack at least one item"),
});

export type PackageFormInput = z.infer<typeof packageFormSchema>;

// Create a package from a sales order: copies SO lines with the packed
// quantity (must be ≤ ordered). No stock movement yet — that happens on
// shipment creation.
export async function createPackage(input: PackageFormInput) {
  const parsed = packageFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error) };
  }
  const data = parsed.data;

  const id = await db.transaction(async (tx) => {
    const number = await nextNumber(tx, "packages");

    const [so] = await tx
      .select()
      .from(salesOrders)
      .where(eq(salesOrders.id, data.salesOrderId));
    if (!so) throw new Error("Sales order not found");

    const soLines = await tx
      .select()
      .from(salesOrderLines)
      .where(eq(salesOrderLines.salesOrderId, data.salesOrderId));
    const soLineByItem = new Map(soLines.map((l) => [l.itemId, l]));

    const [pkg] = await tx
      .insert(packages)
      .values({
        number,
        date: data.date,
        contactId: so.contactId,
        salesOrderId: so.id,
        warehouseId: data.warehouseId,
        status: "draft",
        notes: data.notes || null,
      })
      .returning();

    await tx.insert(packageLines).values(
      data.lines.map((l) => {
        const soLine = soLineByItem.get(l.itemId);
        const ordered = Number(soLine?.quantity ?? 0);
        const packed = l.quantity ?? 1;
        if (packed > ordered) {
          throw new Error(
            `Packed quantity ${packed} exceeds ordered ${ordered} for an item`,
          );
        }
        return {
          packageId: pkg.id,
          itemId: l.itemId,
          name: soLine?.name ?? "Item",
          quantity: packed,
          rate: Number(soLine?.rate ?? 0),
          amount: Math.round(Number(soLine?.rate ?? 0) * packed * 100) / 100,
        };
      }),
    );

    // Mark the SO as packed if it isn't further along
    if (so.status === "confirmed" || so.status === "draft") {
      await tx
        .update(salesOrders)
        .set({ status: "packed", updatedAt: new Date() })
        .where(eq(salesOrders.id, so.id));
    }
    return pkg.id;
  });

  await logActivity({
    action: "created package",
    entityType: "package",
    entityId: id,
  });

  revalidatePath(PATH);
  revalidatePath("/office/sales/sales-orders");
  redirect(`${PATH}/${id}`);
}

export async function deletePackage(id: string) {
  // Only drafts; shipped packages have stock movements tied to their shipment
  await db.delete(packages).where(eq(packages.id, id));
  await logActivity({
    action: "deleted package",
    entityType: "package",
    entityId: id,
  });
  revalidatePath(PATH);
  redirect(PATH);
}

export async function deletePackages(ids: string[]) {
  if (!ids.length) return;
  await db.delete(packages).where(inArray(packages.id, ids));
  revalidatePath(PATH);
}
