import {
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { contacts } from "./contacts";
import { taxes } from "./settings";

export const itemTypeEnum = pgEnum("item_type", [
  "inventory",
  "non_inventory",
  "service",
]);
export const itemStatusEnum = pgEnum("item_status", ["active", "inactive"]);
export const priceListTypeEnum = pgEnum("price_list_type", [
  "markup",
  "markdown",
]);
export const itemStatus = itemStatusEnum.enumValues;

export const units = pgTable("units", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

export const brands = pgTable("brands", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

export const itemGroups = pgTable("item_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  description: text("description"),
  status: itemStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const items = pgTable("items", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: itemTypeEnum("type").notNull().default("inventory"),
  sku: text("sku").unique(),
  groupId: uuid("group_id").references(() => itemGroups.id),
  unitId: uuid("unit_id").references(() => units.id),
  brandId: uuid("brand_id").references(() => brands.id),
  categoryId: uuid("category_id").references(() => categories.id),
  taxId: uuid("tax_id").references(() => taxes.id),
  description: text("description"),
  costPrice: numeric("cost_price", {
    precision: 14,
    scale: 2,
    mode: "number",
  }),
  sellingPrice: numeric("selling_price", {
    precision: 14,
    scale: 2,
    mode: "number",
  }),
  wholesalePrice: numeric("wholesale_price", {
    precision: 14,
    scale: 2,
    mode: "number",
  }),
  reorderLevel: numeric("reorder_level", {
    precision: 14,
    scale: 4,
    mode: "number",
  }),
  // Buy Info: preferred vendor (Zoho item form)
  preferredVendorId: uuid("preferred_vendor_id").references(() => contacts.id),
  status: itemStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Kits/bundles sold as one unit, composed of other items
export const compositeItems = pgTable("composite_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  sku: text("sku").unique(),
  unitId: uuid("unit_id").references(() => units.id),
  brandId: uuid("brand_id").references(() => brands.id),
  categoryId: uuid("category_id").references(() => categories.id),
  description: text("description"),
  status: itemStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const compositeComponents = pgTable("composite_components", {
  id: uuid("id").primaryKey().defaultRandom(),
  compositeItemId: uuid("composite_item_id")
    .notNull()
    .references(() => compositeItems.id, { onDelete: "cascade" }),
  itemId: uuid("item_id")
    .notNull()
    .references(() => items.id),
  quantity: numeric("quantity", {
    precision: 14,
    scale: 4,
    mode: "number",
  }).notNull(),
});

export const priceLists = pgTable("price_lists", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  currencyCode: text("currency_code").notNull(),
  priceType: priceListTypeEnum("price_type").notNull().default("markup"),
  percentage: numeric("percentage", {
    precision: 6,
    scale: 2,
    mode: "number",
  }).notNull(),
  status: itemStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const priceListItems = pgTable("price_list_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  priceListId: uuid("price_list_id")
    .notNull()
    .references(() => priceLists.id, { onDelete: "cascade" }),
  itemId: uuid("item_id")
    .notNull()
    .references(() => items.id),
  customPrice: numeric("custom_price", {
    precision: 14,
    scale: 2,
    mode: "number",
  }),
});

