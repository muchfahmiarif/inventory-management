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
import { warehouses as warehousesTable } from "./warehouses";

export const poStatusEnum = pgEnum("po_status", [
  "draft",
  "open",
  "partially_received",
  "received",
  "billed",
  "cancelled",
]);
export const billStatusEnum = pgEnum("bill_status", [
  "draft",
  "open",
  "partially_paid",
  "paid",
  "overdue",
  "void",
]);
export const debitNoteStatusEnum = pgEnum("debit_note_status", [
  "open",
  "closed",
  "void",
]);
export const expenseStatusEnum = pgEnum("expense_status", [
  "recorded",
  "billable",
  "reimbursed",
]);

const money = (name: string) =>
  numeric(name, { precision: 14, scale: 2, mode: "number" });

const lineFields = {
  itemId: uuid("item_id")
    .notNull()
    .references(() => items.id),
  name: text("name").notNull(),
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

export const purchaseOrders = pgTable("purchase_orders", {
  ...headerFields("purchase_orders_number"),
  expectedDeliveryDate: date("expected_delivery_date"),
  // Warehouse goods are delivered into (used by Receive Items stock-in)
  warehouseId: uuid("warehouse_id").references(() => warehousesTable.id),
  status: poStatusEnum("status").notNull().default("draft"),
});

export const purchaseOrderLines = pgTable("purchase_order_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  purchaseOrderId: uuid("purchase_order_id")
    .notNull()
    .references(() => purchaseOrders.id, { onDelete: "cascade" }),
  ...lineFields,
});

export const bills = pgTable("bills", {
  ...headerFields("bills_number"),
  dueDate: date("due_date"),
  purchaseOrderId: uuid("purchase_order_id").references(() =>
    purchaseOrders.id,
  ),
  amountPaid: money("amount_paid").notNull().default(0),
  status: billStatusEnum("status").notNull().default("draft"),
});

export const billLines = pgTable("bill_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  billId: uuid("bill_id")
    .notNull()
    .references(() => bills.id, { onDelete: "cascade" }),
  ...lineFields,
});

export const vendorPayments = pgTable("vendor_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  number: text("number").notNull().unique(),
  date: date("date").notNull(),
  contactId: uuid("contact_id")
    .notNull()
    .references(() => contacts.id),
  billId: uuid("bill_id").references(() => bills.id),
  amount: money("amount").notNull(),
  mode: text("mode"),
  reference: text("reference"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const debitNotes = pgTable("debit_notes", {
  ...headerFields("debit_notes_number"),
  billId: uuid("bill_id").references(() => bills.id),
  status: debitNoteStatusEnum("status").notNull().default("open"),
});

export const debitNoteLines = pgTable("debit_note_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  debitNoteId: uuid("debit_note_id")
    .notNull()
    .references(() => debitNotes.id, { onDelete: "cascade" }),
  ...lineFields,
});

export const expenseCategories = pgTable("expense_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
});

export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  number: text("number").notNull().unique(),
  date: date("date").notNull(),
  vendorId: uuid("vendor_id").references(() => contacts.id),
  categoryId: uuid("category_id").references(() => expenseCategories.id),
  description: text("description"),
  amount: money("amount").notNull(),
  taxId: uuid("tax_id").references(() => taxes.id),
  status: expenseStatusEnum("status").notNull().default("recorded"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
