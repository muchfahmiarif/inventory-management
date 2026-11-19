import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const contactTypeEnum = pgEnum("contact_type", ["customer", "vendor"]);
export const contactStatusEnum = pgEnum("contact_status", ["active", "inactive"]);

// Customers and vendors share one table (Zoho treats them as Contacts)
export const contacts = pgTable("contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: contactTypeEnum("type").notNull(),
  displayName: text("display_name").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  companyName: text("company_name"),
  email: text("email"),
  phone: text("phone"),
  mobile: text("mobile"),
  website: text("website"),
  // Billing address
  billingAddressLine1: text("billing_address_line1"),
  billingCity: text("billing_city"),
  billingState: text("billing_state"),
  billingZip: text("billing_zip"),
  billingCountry: text("billing_country"),
  // Shipping address
  shippingAddressLine1: text("shipping_address_line1"),
  shippingCity: text("shipping_city"),
  shippingState: text("shipping_state"),
  shippingZip: text("shipping_zip"),
  shippingCountry: text("shipping_country"),
  taxNumber: text("tax_number"),
  currencyCode: text("currency_code"),
  notes: text("notes"),
  status: contactStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const contactPersons = pgTable("contact_persons", {
  id: uuid("id").primaryKey().defaultRandom(),
  contactId: uuid("contact_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  designation: text("designation"),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
