import { and, desc, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "@/db";
import {
  contacts,
  invoiceLines,
  invoices,
  items,
  purchaseOrderLines,
  purchaseOrders,
  stockMovements,
  warehouses,
} from "@/db/schema";

// Report definitions + queries for /office/reports/[slug].
// Each report returns rows shaped for a generic table renderer.

export interface ReportColumn {
  key: string;
  header: string;
  align?: "left" | "right";
  money?: boolean;
  qty?: boolean;
}

export interface ReportDefinition {
  slug: string;
  title: string;
  group: "Inventory" | "Sales" | "Purchases";
  description: string;
  columns: ReportColumn[];
  load: () => Promise<Record<string, unknown>[]>;
}

export async function getStockSummary() {
  const w = alias(warehouses, "w");
  const rows = await db
    .select({
      name: items.name,
      sku: items.sku,
      warehouse: sql<string>`coalesce(${w.name}, '-')`,
      quantity: sql<number>`coalesce(sum(${stockMovements.quantity}), 0)::float8`,
    })
    .from(stockMovements)
    .innerJoin(items, eq(stockMovements.itemId, items.id))
    .leftJoin(w, eq(stockMovements.warehouseId, w.id))
    .groupBy(items.name, items.sku, w.name)
    .orderBy(items.name);
  return rows;
}

export async function getInventoryValuation() {
  const stockByItem = await db
    .select({
      itemId: stockMovements.itemId,
      quantity: sql<number>`coalesce(sum(${stockMovements.quantity}), 0)::float8`,
    })
    .from(stockMovements)
    .groupBy(stockMovements.itemId);

  const itemRows = await db
    .select({ id: items.id, name: items.name, sku: items.sku, cost: items.costPrice })
    .from(items);

  const stockMap = new Map(stockByItem.map((r) => [r.itemId, r.quantity]));
  return itemRows
    .map((i) => {
      const qty = stockMap.get(i.id) ?? 0;
      const cost = i.cost ?? 0;
      return {
        name: i.name,
        sku: i.sku,
        quantity: qty,
        costPrice: i.cost,
        value: Math.round(qty * cost * 100) / 100,
      };
    })
    .sort((a, b) => b.value - a.value);
}

export async function getLowStock() {
  const stockByItem = await db
    .select({
      itemId: stockMovements.itemId,
      quantity: sql<number>`coalesce(sum(${stockMovements.quantity}), 0)::float8`,
    })
    .from(stockMovements)
    .groupBy(stockMovements.itemId);

  const stockMap = new Map(stockByItem.map((r) => [r.itemId, r.quantity]));
  const rows = await db
    .select({
      id: items.id,
      name: items.name,
      sku: items.sku,
      reorderLevel: items.reorderLevel,
      type: items.type,
    })
    .from(items)
    .where(and(eq(items.type, "inventory"), eq(items.status, "active")));

  return rows
    .map((r) => ({ ...r, stockOnHand: stockMap.get(r.id) ?? 0 }))
    .filter(
      (r) => r.reorderLevel !== null && r.stockOnHand <= r.reorderLevel,
    );
}

export async function getSalesByCustomer() {
  return db
    .select({
      customer: contacts.displayName,
      invoices: sql<number>`count(*)::int`,
      total: sql<number>`coalesce(sum(${invoices.total}), 0)::float8`,
      paid: sql<number>`coalesce(sum(${invoices.amountPaid}), 0)::float8`,
    })
    .from(invoices)
    .leftJoin(contacts, eq(invoices.contactId, contacts.id))
    .groupBy(contacts.displayName)
    .orderBy(desc(sql`sum(${invoices.total})`));
}

export async function getSalesByItem() {
  return db
    .select({
      item: invoiceLines.name,
      quantity: sql<number>`coalesce(sum(${invoiceLines.quantity}), 0)::float8`,
      total: sql<number>`coalesce(sum(${invoiceLines.amount}), 0)::float8`,
    })
    .from(invoiceLines)
    .groupBy(invoiceLines.name)
    .orderBy(desc(sql`sum(${invoiceLines.amount})`));
}

export async function getPurchasesByVendor() {
  return db
    .select({
      vendor: contacts.displayName,
      orders: sql<number>`count(*)::int`,
      total: sql<number>`coalesce(sum(${purchaseOrders.total}), 0)::float8`,
    })
    .from(purchaseOrders)
    .leftJoin(contacts, eq(purchaseOrders.contactId, contacts.id))
    .groupBy(contacts.displayName)
    .orderBy(desc(sql`sum(${purchaseOrders.total})`));
}

export const REPORTS: ReportDefinition[] = [
  {
    slug: "stock-summary",
    title: "Stock Summary",
    group: "Inventory",
    description: "Quantity on hand per item per warehouse.",
    columns: [
      { key: "name", header: "Item" },
      { key: "sku", header: "Code" },
      { key: "warehouse", header: "Warehouse" },
      { key: "quantity", header: "Quantity", align: "right", qty: true },
    ],
    load: getStockSummary,
  },
  {
    slug: "inventory-valuation",
    title: "Inventory Valuation",
    group: "Inventory",
    description: "Stock value = quantity on hand × cost price.",
    columns: [
      { key: "name", header: "Item" },
      { key: "sku", header: "Code" },
      { key: "quantity", header: "Qty", align: "right", qty: true },
      { key: "costPrice", header: "Cost Price", align: "right", money: true },
      { key: "value", header: "Stock Value", align: "right", money: true },
    ],
    load: getInventoryValuation,
  },
  {
    slug: "low-stock",
    title: "Low Stock",
    group: "Inventory",
    description: "Active inventory items at or below their reorder level.",
    columns: [
      { key: "name", header: "Item" },
      { key: "sku", header: "Code" },
      { key: "stockOnHand", header: "Stock on Hand", align: "right", qty: true },
      { key: "reorderLevel", header: "Reorder Level", align: "right", qty: true },
    ],
    load: getLowStock,
  },
  {
    slug: "sales-by-customer",
    title: "Sales by Customer",
    group: "Sales",
    description: "Invoiced amounts grouped by customer.",
    columns: [
      { key: "customer", header: "Customer" },
      { key: "invoices", header: "Invoices", align: "right", qty: true },
      { key: "total", header: "Total", align: "right", money: true },
      { key: "paid", header: "Paid", align: "right", money: true },
    ],
    load: getSalesByCustomer,
  },
  {
    slug: "sales-by-item",
    title: "Sales by Item",
    group: "Sales",
    description: "Invoiced quantity and value grouped by item.",
    columns: [
      { key: "item", header: "Item" },
      { key: "quantity", header: "Qty Sold", align: "right", qty: true },
      { key: "total", header: "Total", align: "right", money: true },
    ],
    load: getSalesByItem,
  },
  {
    slug: "purchases-by-vendor",
    title: "Purchases by Vendor",
    group: "Purchases",
    description: "Purchase order value grouped by vendor.",
    columns: [
      { key: "vendor", header: "Vendor" },
      { key: "orders", header: "Orders", align: "right", qty: true },
      { key: "total", header: "Total", align: "right", money: true },
    ],
    load: getPurchasesByVendor,
  },
];

export function getReportBySlug(slug: string) {
  return REPORTS.find((r) => r.slug === slug);
}
