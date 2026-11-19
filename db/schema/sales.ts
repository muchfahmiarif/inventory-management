import {
  date,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { contacts } from "./contacts";
import { items } from "./items";
import { taxes } from "./settings";

export const estimateStatusEnum = pgEnum("estimate_status", [
  "draft",
  "sent",
  "viewed",
  "accepted",
  "declined",
  "expired",
]);
export const salesOrderStatusEnum = pgEnum("sales_order_status", [
  "draft",
  "confirmed",
  "packed",
  "shipped",
  "invoiced",
  "fulfilled",
  "cancelled",
]);
export const packageStatusEnum = pgEnum("package_status", [
  "draft",
  "shipped",
  "delivered",
]);
export const shipmentStatusEnum = pgEnum("shipment_status", [
  "draft",
  "shipped",
  "delivered",
]);
export const challanStatusEnum = pgEnum("challan_status", [
  "draft",
  "sent",
  "invoiced",
  "cancelled",
]);
export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "sent",
  "partially_paid",
  "paid",
  "overdue",
  "void",
]);
export const creditNoteStatusEnum = pgEnum("credit_note_status", [
  "open",
  "closed",
  "void",
]);
export const salesReturnStatusEnum = pgEnum("sales_return_status", [
  "draft",
  "received",
  "cancelled",
]);

const money = (name: string) =>
  numeric(name, { precision: 14, scale: 2, mode: "number" });

// Shared line shape for all sales documents
const lineFields = {
  itemId: uuid("item_id")
    .notNull()
    .references(() => items.id),
  name: text("name").notNull(), // snapshot of the item name at save time
  description: text("description"),
  quantity: numeric("quantity", {
    precision: 14,
    scale: 4,
    mode: "number",
  }).notNull(),
  rate: money("rate").notNull(),
  discountPercent: numeric("discount_percent", {
    precision: 6,
    scale: 2,
    mode: "number",
  })
    .notNull()
    .default(0),
  taxId: uuid("tax_id").references(() => taxes.id),
  amount: money("amount").notNull(),
};

// Function (not object) so each table gets its own unique-constraint name —
// shared builders bind constraint names at first use, colliding across tables.
const headerFields = (numberConstraint: string) => ({
  id: uuid("id").primaryKey().defaultRandom(),
  number: text("number")
    .notNull()
    .unique(numberConstraint),
  date: date("date").notNull(),
  contactId: uuid("contact_id")
    .notNull()
    .references(() => contacts.id),
  reference: text("reference"),
  notes: text("notes"),
  terms: text("terms"),
  subtotal: money("subtotal").notNull().default(0),
  discountTotal: money("discount_total").notNull().default(0),
  taxTotal: money("tax_total").notNull().default(0),
  total: money("total").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const estimates = pgTable("estimates", {
  ...headerFields("estimates_number"),
  expiryDate: date("expiry_date"),
  status: estimateStatusEnum("status").notNull().default("draft"),
});

export const estimateLines = pgTable("estimate_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  estimateId: uuid("estimate_id")
    .notNull()
    .references(() => estimates.id, { onDelete: "cascade" }),
  ...lineFields,
});

export const salesOrders = pgTable("sales_orders", {
  ...headerFields("sales_orders_number"),
  expectedShipmentDate: date("expected_shipment_date"),
  status: salesOrderStatusEnum("status").notNull().default("draft"),
});

export const salesOrderLines = pgTable("sales_order_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  salesOrderId: uuid("sales_order_id")
    .notNull()
    .references(() => salesOrders.id, { onDelete: "cascade" }),
  ...lineFields,
});

export const packages = pgTable("packages", {
  ...headerFields("packages_number"),
  salesOrderId: uuid("sales_order_id").references(() => salesOrders.id),
  status: packageStatusEnum("status").notNull().default("draft"),
});

export const packageLines = pgTable("package_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  packageId: uuid("package_id")
    .notNull()
    .references(() => packages.id, { onDelete: "cascade" }),
  ...lineFields,
});

export const shipments = pgTable("shipments", {
  ...headerFields("shipments_number"),
  salesOrderId: uuid("sales_order_id").references(() => salesOrders.id),
  packageId: uuid("package_id").references(() => packages.id),
  carrier: text("carrier"),
  trackingNumber: text("tracking_number"),
  status: shipmentStatusEnum("status").notNull().default("draft"),
});

export const shipmentLines = pgTable("shipment_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  shipmentId: uuid("shipment_id")
    .notNull()
    .references(() => shipments.id, { onDelete: "cascade" }),
  ...lineFields,
});

export const deliverChallans = pgTable("deliver_challans", {
  ...headerFields("deliver_challans_number"),
  status: challanStatusEnum("status").notNull().default("draft"),
});

export const deliverChallanLines = pgTable("deliver_challan_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  challanId: uuid("challan_id")
    .notNull()
    .references(() => deliverChallans.id, { onDelete: "cascade" }),
  ...lineFields,
});

export const invoices = pgTable("invoices", {
  ...headerFields("invoices_number"),
  dueDate: date("due_date"),
  salesOrderId: uuid("sales_order_id").references(() => salesOrders.id),
  amountPaid: money("amount_paid").notNull().default(0),
  status: invoiceStatusEnum("status").notNull().default("draft"),
});

export const invoiceLines = pgTable("invoice_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  ...lineFields,
});

export const customerPayments = pgTable("customer_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  number: text("number").notNull().unique(),
  date: date("date").notNull(),
  contactId: uuid("contact_id")
    .notNull()
    .references(() => contacts.id),
  invoiceId: uuid("invoice_id").references(() => invoices.id),
  amount: money("amount").notNull(),
  mode: text("mode"), // cash | bank_transfer | card | cheque | other
  reference: text("reference"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creditNotes = pgTable("credit_notes", {
  ...headerFields("credit_notes_number"),
  invoiceId: uuid("invoice_id").references(() => invoices.id),
  status: creditNoteStatusEnum("status").notNull().default("open"),
});

export const creditNoteLines = pgTable("credit_note_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  creditNoteId: uuid("credit_note_id")
    .notNull()
    .references(() => creditNotes.id, { onDelete: "cascade" }),
  ...lineFields,
});

export const salesReturns = pgTable("sales_returns", {
  ...headerFields("sales_returns_number"),
  invoiceId: uuid("invoice_id").references(() => invoices.id),
  status: salesReturnStatusEnum("status").notNull().default("draft"),
});

export const salesReturnLines = pgTable("sales_return_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  salesReturnId: uuid("sales_return_id")
    .notNull()
    .references(() => salesReturns.id, { onDelete: "cascade" }),
  ...lineFields,
});
