import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// Taxes (simple or group)
export const taxes = pgTable("taxes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  rate: numeric("rate", { precision: 6, scale: 2, mode: "number" }).notNull(),
  isGroup: boolean("is_group").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Component taxes of a group tax (taxId = the group, componentTaxId = member)
export const taxGroupComponents = pgTable("tax_group_components", {
  id: uuid("id").primaryKey().defaultRandom(),
  taxId: uuid("tax_id")
    .notNull()
    .references(() => taxes.id, { onDelete: "cascade" }),
  componentTaxId: uuid("component_tax_id")
    .notNull()
    .references(() => taxes.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const currencies = pgTable("currencies", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  exchangeRate: numeric("exchange_rate", {
    precision: 14,
    scale: 6,
    mode: "number",
  })
    .notNull()
    .default(1),
  isDefault: boolean("is_default").notNull().default(false),
});

// Auto numbering per module, e.g. prefix "ITEM", nextNumber 1, padding 5 -> ITEM-00001
export const numberingSeries = pgTable("numbering_series", {
  id: uuid("id").primaryKey().defaultRandom(),
  module: text("module").notNull().unique(),
  prefix: text("prefix").notNull(),
  nextNumber: integer("next_number").notNull().default(1),
  padding: integer("padding").notNull().default(5),
});

export const templates = pgTable("templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: text("type").notNull(), // e.g. "invoice", "estimate", "email"
  subject: text("subject"),
  body: text("body"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notificationPrefs = pgTable("notification_prefs", {
  id: uuid("id").primaryKey().defaultRandom(),
  module: text("module").notNull(),
  config: jsonb("config").notNull().default({}),
});

export const automationPrefs = pgTable("automation_prefs", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  config: jsonb("config").notNull().default({}),
});
