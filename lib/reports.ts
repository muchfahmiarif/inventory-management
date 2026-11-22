// Report definitions for /office/reports. Rows and columns are served by the
// Go backend (GET /api/v1/reports/{slug}); this list drives the index page.
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
  },
];

export function getReportBySlug(slug: string) {
  return REPORTS.find((r) => r.slug === slug);
}
