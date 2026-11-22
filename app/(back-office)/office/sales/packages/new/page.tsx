import Link from "next/link";

import PackageForm from "@/components/office/transactions/package-form";
import { api } from "@/lib/api-client";

type EligibleSO = {
  id: string;
  number: string;
  status: string;
  customerName: string | null;
};

type PackageFormOptions = {
  salesOrder: { id: string; number: string; customerName: string };
  warehouses: { id: string; name: string }[];
  lines: { itemId: string; name: string; ordered: number }[];
};

export default async function NewPackagePage({
  searchParams,
}: {
  searchParams: Promise<{ soId?: string }>;
}) {
  const { soId } = await searchParams;

  if (!soId) {
    const eligible = await api.get<EligibleSO[]>("/packages/eligible-sales-orders");

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

  const options = await api.get<PackageFormOptions>(
    `/packages/form-options?soId=${encodeURIComponent(soId)}`,
  );

  return (
    <PackageForm
      soId={options.salesOrder.id}
      soNumber={options.salesOrder.number}
      customerName={options.salesOrder.customerName}
      defaultValues={{
        date: new Date().toISOString().slice(0, 10),
        warehouseId: options.warehouses[0]?.id ?? "",
        lines: options.lines.map((l) => ({
          itemId: l.itemId,
          quantity: String(l.ordered),
        })),
      }}
      warehouses={options.warehouses}
      lines={options.lines}
    />
  );
}
