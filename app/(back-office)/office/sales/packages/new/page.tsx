import Link from "next/link";

import PackageForm from "@/components/office/transactions/package-form";
import { db } from "@/db";
import { contacts, salesOrderLines, salesOrders, warehouses } from "@/db/schema";
import { asc, eq, inArray } from "drizzle-orm";

export default async function NewPackagePage({
  searchParams,
}: {
  searchParams: Promise<{ soId?: string }>;
}) {
  const { soId } = await searchParams;

  if (!soId) {
    // SO picker: eligible orders are confirmed or packed
    const eligible = await db
      .select({
        id: salesOrders.id,
        number: salesOrders.number,
        status: salesOrders.status,
        customerName: contacts.displayName,
      })
      .from(salesOrders)
      .leftJoin(contacts, eq(salesOrders.contactId, contacts.id))
      .where(inArray(salesOrders.status, ["confirmed", "packed"]))
      .orderBy(asc(salesOrders.number));

    return (
      <div className="flex flex-col px-8 py-6">
        <h2 className="text-3xl">New Package</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Pick a confirmed sales order to pack:
        </p>
        <div className="mt-4 flex max-w-2xl flex-col gap-2">
          {eligible.length ? (
            eligible.map((so) => (
              <Link
                key={so.id}
                href={`/office/sales/packages/new?soId=${so.id}`}
                className="flex items-center justify-between rounded-md border bg-white p-4 drop-shadow-sm hover:border-primary dark:bg-card"
              >
                <span className="font-medium">{so.number}</span>
                <span className="text-sm text-muted-foreground">
                  {so.customerName ?? "-"} · {so.status}
                </span>
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No confirmed sales orders yet. Confirm an order first.
            </p>
          )}
        </div>
      </div>
    );
  }

  const [so] = await db
    .select({
      id: salesOrders.id,
      number: salesOrders.number,
      customerName: contacts.displayName,
    })
    .from(salesOrders)
    .leftJoin(contacts, eq(salesOrders.contactId, contacts.id))
    .where(eq(salesOrders.id, soId));
  if (!so) throw new Error("Sales order not found");

  const [warehouseRows, lineRows] = await Promise.all([
    db
      .select({ id: warehouses.id, name: warehouses.name })
      .from(warehouses)
      .orderBy(asc(warehouses.name)),
    db
      .select({
        itemId: salesOrderLines.itemId,
        name: salesOrderLines.name,
        quantity: salesOrderLines.quantity,
      })
      .from(salesOrderLines)
      .where(eq(salesOrderLines.salesOrderId, soId))
      .orderBy(asc(salesOrderLines.id)),
  ]);

  return (
    <PackageForm
      soId={so.id}
      soNumber={so.number}
      customerName={so.customerName ?? "Unknown"}
      defaultValues={{
        date: new Date().toISOString().slice(0, 10),
        warehouseId: warehouseRows[0]?.id ?? "",
        lines: lineRows.map((l) => ({
          itemId: l.itemId,
          quantity: String(l.quantity),
        })),
      }}
      warehouses={warehouseRows}
      lines={lineRows.map((l) => ({
        itemId: l.itemId,
        name: l.name,
        ordered: Number(l.quantity),
      }))}
    />
  );
}
