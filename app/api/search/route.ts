import { eq, ilike, or } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { contacts, invoices, items, salesOrders } from "@/db/schema";

// Global search across items, contacts and transaction numbers
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 1) {
    return NextResponse.json({ results: [] });
  }
  const pattern = `%${q}%`;

  const [itemRows, contactRows, invoiceRows, soRows] = await Promise.all([
    db
      .select({ id: items.id, label: items.name, extra: items.sku })
      .from(items)
      .where(or(ilike(items.name, pattern), ilike(items.sku, pattern)))
      .limit(5),
    db
      .select({ id: contacts.id, label: contacts.displayName, extra: contacts.type })
      .from(contacts)
      .where(ilike(contacts.displayName, pattern))
      .limit(5),
    db
      .select({ id: invoices.id, label: invoices.number, extra: contacts.displayName })
      .from(invoices)
      .leftJoin(contacts, eq(invoices.contactId, contacts.id))
      .where(ilike(invoices.number, pattern))
      .limit(4),
    db
      .select({ id: salesOrders.id, label: salesOrders.number, extra: contacts.displayName })
      .from(salesOrders)
      .leftJoin(contacts, eq(salesOrders.contactId, contacts.id))
      .where(ilike(salesOrders.number, pattern))
      .limit(4),
  ]);

  return NextResponse.json({
    results: [
      ...itemRows.map((r) => ({
        group: "Items",
        label: r.label,
        extra: r.extra,
        href: `/office/inventory/items/${r.id}`,
      })),
      ...invoiceRows.map((r) => ({
        group: "Invoices",
        label: r.label,
        extra: r.extra,
        href: `/office/sales/invoices/${r.id}`,
      })),
      ...soRows.map((r) => ({
        group: "Sales Orders",
        label: r.label,
        extra: r.extra,
        href: `/office/sales/sales-orders/${r.id}`,
      })),
      ...contactRows.map((r) => ({
        group: r.extra === "vendor" ? "Vendors" : "Customers",
        label: r.label,
        extra: null,
        href:
          r.extra === "vendor"
            ? `/office/purchases/vendors/${r.id}`
            : `/office/sales/customers/${r.id}`,
      })),
    ],
  });
}
