import { CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";

import { api } from "@/lib/api-client";
import { Progress } from "@/components/ui/progress";

type GettingStartedCounts = {
  items: number;
  customers: number;
  invoices: number;
  purchaseOrders: number;
  orgComplete: boolean;
};

const STEPS: {
  label: string;
  done: (c: GettingStartedCounts) => boolean;
  href: string;
}[] = [
  { label: "Add your first item", done: (c) => c.items > 0, href: "/office/inventory/items/new" },
  { label: "Add a customer", done: (c) => c.customers > 0, href: "/office/sales/customers/new" },
  { label: "Complete organization profile", done: (c) => c.orgComplete, href: "/office/settings/organization" },
  { label: "Create your first invoice", done: (c) => c.invoices > 0, href: "/office/sales/invoices/new" },
  { label: "Create a purchase order", done: (c) => c.purchaseOrders > 0, href: "/office/purchases/purchase-orders/new" },
];

export default async function GettingStartedPage() {
  const counts = await api.get<GettingStartedCounts>("/getting-started");

  const doneCount = STEPS.filter((s) => s.done(counts)).length;
  const pct = Math.round((doneCount / STEPS.length) * 100);

  return (
    <div className="flex flex-col gap-6 px-8 py-6">
      <h2 className="text-2xl font-semibold">Getting Started</h2>
      <div className="flex items-center gap-4">
        <Progress value={pct} className="max-w-md" />
        <span className="text-sm text-muted-foreground">
          {doneCount}/{STEPS.length} complete
        </span>
      </div>
      <div className="flex max-w-2xl flex-col gap-2">
        {STEPS.map((step) => {
          const done = step.done(counts);
          return (
            <Link
              key={step.label}
              href={step.href}
              className="flex items-center gap-3 rounded-md border bg-white p-4 drop-shadow-sm hover:border-primary dark:bg-card"
            >
              {done ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <span className={done ? "text-muted-foreground line-through" : "font-medium"}>
                {step.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
