import { sql } from "drizzle-orm";
import { CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";

import { db } from "@/db";
import {
  contacts,
  invoices,
  items,
  organization,
  purchaseOrders,
  salesOrders,
} from "@/db/schema";
import { Progress } from "@/components/ui/progress";

async function getCounts() {
  const [
    [itemsCount],
    [customersCount],
    [invoicesCount],
    [poCount],
    [orgRow],
  ] = await Promise.all([
    db.select({ c: sql<number>`count(*)::int` }).from(items),
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(contacts)
      .where(sql`${contacts.type} = 'customer'`),
    db.select({ c: sql<number>`count(*)::int` }).from(invoices),
    db.select({ c: sql<number>`count(*)::int` }).from(purchaseOrders),
    db.select().from(organization).limit(1),
  ]);
  const orgComplete = Boolean(
    orgRow?.addressLine1 && orgRow?.city && orgRow?.country && orgRow?.email,
  );
  return {
    items: itemsCount.c,
    customers: customersCount.c,
    invoices: invoicesCount.c,
    purchaseOrders: poCount.c,
    orgComplete,
  };
}

export default async function GettingStartedPage() {
  const counts = await getCounts();

  const steps = [
    {
      label: "Add your first item",
      done: counts.items > 0,
      href: "/office/inventory/items/new",
    },
    {
      label: "Add your first customer",
      done: counts.customers > 0,
      href: "/office/sales/customers/new",
    },
    {
      label: "Create your first purchase order",
      done: counts.purchaseOrders > 0,
      href: "/office/purchases/purchase-orders/new",
    },
    {
      label: "Create your first invoice",
      done: counts.invoices > 0,
      href: "/office/sales/invoices/new",
    },
    {
      label: "Complete your organization profile",
      done: counts.orgComplete,
      href: "/office/home/getting-started",
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const percent = Math.round((doneCount / steps.length) * 100);

  return (
    <div className="flex flex-col gap-6 px-8 py-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Get started with Genero</h2>
        <span className="text-sm text-muted-foreground">
          {doneCount}/{steps.length} completed
        </span>
      </div>
      <Progress value={percent} className="max-w-2xl" />

      <div className="grid max-w-3xl grid-cols-1 gap-3">
        {steps.map((step) => (
          <Link
            key={step.label}
            href={step.done ? "/office/home/getting-started" : step.href}
            className="flex items-center gap-3 rounded-md border bg-white p-4 drop-shadow-sm transition-colors hover:border-primary dark:bg-card"
          >
            {step.done ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
            <span
              className={
                step.done
                  ? "text-sm text-muted-foreground line-through"
                  : "text-sm font-medium"
              }
            >
              {step.label}
            </span>
            {!step.done && (
              <span className="ml-auto text-xs text-primary">Get started →</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
