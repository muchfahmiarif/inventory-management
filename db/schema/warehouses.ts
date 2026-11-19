import {
  boolean,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { items } from "./items";

export const adjustmentStatusEnum = pgEnum("adjustment_status", ["approved"]);
export const stockCountStatusEnum = pgEnum("stock_count_status", [
  "draft",
  "completed",
]);
export const transferStatusEnum = pgEnum("transfer_status", [
  "draft",
  "shipped",
  "received",
]);

export const warehouses = pgTable("warehouses", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  code: text("code"),
  addressLine1: text("address_line1"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  country: text("country"),
  contactName: text("contact_name"),
  phone: text("phone"),
  email: text("email"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const inventoryAdjustments = pgTable("inventory_adjustments", {
  id: uuid("id").primaryKey().defaultRandom(),
  number: text("number").notNull().unique(),
  date: text("date").notNull(), // YYYY-MM-DD
  reference: text("reference"),
  reason: text("reason"),
  warehouseId: uuid("warehouse_id")
    .notNull()
    .references(() => warehouses.id),
  status: adjustmentStatusEnum("status").notNull().default("approved"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const inventoryAdjustmentLines = pgTable("inventory_adjustment_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  adjustmentId: uuid("adjustment_id")
    .notNull()
    .references(() => inventoryAdjustments.id, { onDelete: "cascade" }),
  itemId: uuid("item_id")
    .notNull()
    .references(() => items.id),
  systemQuantity: numeric("system_quantity", {
    precision: 14,
    scale: 4,
    mode: "number",
  }).notNull(),
  adjustedQuantity: numeric("adjusted_quantity", {
    precision: 14,
    scale: 4,
    mode: "number",
  }).notNull(),
});

export const stockCounts = pgTable("stock_counts", {
  id: uuid("id").primaryKey().defaultRandom(),
  number: text("number").notNull().unique(),
  date: text("date").notNull(),
  warehouseId: uuid("warehouse_id")
    .notNull()
    .references(() => warehouses.id),
  status: stockCountStatusEnum("status").notNull().default("draft"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const stockCountLines = pgTable("stock_count_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  stockCountId: uuid("stock_count_id")
    .notNull()
    .references(() => stockCounts.id, { onDelete: "cascade" }),
  itemId: uuid("item_id")
    .notNull()
    .references(() => items.id),
  systemQuantity: numeric("system_quantity", {
    precision: 14,
    scale: 4,
    mode: "number",
  }).notNull(),
  countedQuantity: numeric("counted_quantity", {
    precision: 14,
    scale: 4,
    mode: "number",
  }),
});

export const transferOrders = pgTable("transfer_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  number: text("number").notNull().unique(),
  date: text("date").notNull(),
  fromWarehouseId: uuid("from_warehouse_id")
    .notNull()
    .references(() => warehouses.id),
  toWarehouseId: uuid("to_warehouse_id")
    .notNull()
    .references(() => warehouses.id),
  status: transferStatusEnum("status").notNull().default("draft"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const transferOrderLines = pgTable("transfer_order_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  transferOrderId: uuid("transfer_order_id")
    .notNull()
    .references(() => transferOrders.id, { onDelete: "cascade" }),
  itemId: uuid("item_id")
    .notNull()
    .references(() => items.id),
  quantity: numeric("quantity", {
    precision: 14,
    scale: 4,
    mode: "number",
  }).notNull(),
});

// Single ledger for every quantity change. quantity is signed:
// positive = stock in, negative = stock out. Stock on hand = sum per item(+warehouse).
export const stockMovements = pgTable("stock_movements", {
  id: uuid("id").primaryKey().defaultRandom(),
  itemId: uuid("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  warehouseId: uuid("warehouse_id").references(() => warehouses.id),
  quantity: numeric("quantity", {
    precision: 14,
    scale: 4,
    mode: "number",
  }).notNull(),
  sourceType: text("source_type").notNull(), // opening | adjustment | transfer | sales_order | purchase_order | invoice | bill ...
  sourceId: uuid("source_id"),
  sourceNumber: text("source_number"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
