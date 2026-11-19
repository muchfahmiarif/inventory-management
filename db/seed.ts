import "dotenv/config";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client, { schema });

const NUMBERING_MODULES = [
  { module: "items", prefix: "ITEM" },
  { module: "item_groups", prefix: "IG" },
  { module: "composite_items", prefix: "CI" },
  { module: "price_lists", prefix: "PL" },
  { module: "adjustments", prefix: "AD" },
  { module: "stock_counts", prefix: "SC" },
  { module: "transfers", prefix: "TO" },
  { module: "customers", prefix: "C" },
  { module: "vendors", prefix: "V" },
  { module: "estimates", prefix: "EST" },
  { module: "sales_orders", prefix: "SO" },
  { module: "packages", prefix: "PKG" },
  { module: "shipments", prefix: "SHP" },
  { module: "deliver_challans", prefix: "DC" },
  { module: "invoices", prefix: "INV" },
  { module: "customer_payments", prefix: "PM" },
  { module: "credit_notes", prefix: "CN" },
  { module: "sales_returns", prefix: "SR" },
  { module: "purchase_orders", prefix: "PO" },
  { module: "bills", prefix: "BILL" },
  { module: "vendor_payments", prefix: "VP" },
  { module: "debit_notes", prefix: "DN" },
  { module: "expenses", prefix: "EX" },
];

async function main() {
  console.log("Seeding inventory_management…");

  // Organization — matches the greeting shown in the app navbar
  await db.insert(schema.organization).values({
    name: "Genero",
    legalName: "PT Genero",
    addressLine1: "Jl. Jenderal Sudirman No. 1",
    city: "Jakarta",
    state: "DKI Jakarta",
    country: "Indonesia",
    currencyCode: "IDR",
    email: "hello@genero.example",
  });

  // Currencies
  await db.insert(schema.currencies).values([
    { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", isDefault: true },
    { code: "USD", name: "US Dollar", symbol: "$", exchangeRate: 16000 },
  ]);

  // Units / brands / categories
  const [pcs, box] = await db
    .insert(schema.units)
    .values([{ name: "pcs" }, { name: "box" }, { name: "kg" }])
    .returning();
  const [genero, acme] = await db
    .insert(schema.brands)
    .values([{ name: "Genero" }, { name: "Acme" }])
    .returning();
  const [electronics, accessories, office] = await db
    .insert(schema.categories)
    .values([
      { name: "Electronics" },
      { name: "Accessories" },
      { name: "Office Supplies" },
    ])
    .returning();

  // Taxes
  const [ppn] = await db
    .insert(schema.taxes)
    .values([{ name: "PPN", rate: 11 }])
    .returning();

  // Warehouses
  const [mainWarehouse] = await db
    .insert(schema.warehouses)
    .values([
      {
        name: "Main Warehouse",
        code: "WH-MAIN",
        city: "Jakarta",
        country: "Indonesia",
        isDefault: true,
      },
      {
        name: "Branch Warehouse",
        code: "WH-BR01",
        city: "Bandung",
        country: "Indonesia",
      },
    ])
    .returning();

  // Item groups
  const [laptops, accessoriesGroup] = await db
    .insert(schema.itemGroups)
    .values([
      { name: "Laptops", description: "Laptops and notebooks" },
      { name: "Accessories", description: "Peripherals and accessories" },
    ])
    .returning();

  // Items (12) — inventory items get opening stock movements
  const itemSeed = [
    { name: "Genero Book Pro 14", sku: "GBP-14", group: laptops.id, brand: genero.id, category: electronics.id, cost: 12000000, sell: 15999000, stock: 10 },
    { name: "Genero Book Air 13", sku: "GBA-13", group: laptops.id, brand: genero.id, category: electronics.id, cost: 9500000, sell: 12999000, stock: 8 },
    { name: "Acme UltraBook 15", sku: "AUB-15", group: laptops.id, brand: acme.id, category: electronics.id, cost: 11000000, sell: 14500000, stock: 5 },
    { name: "Genero Desk Monitor 27\"", sku: "GDM-27", group: accessoriesGroup.id, brand: genero.id, category: electronics.id, cost: 2500000, sell: 3399000, stock: 20 },
    { name: "Acme Wide Monitor 32\"", sku: "AWM-32", group: accessoriesGroup.id, brand: acme.id, category: electronics.id, cost: 3800000, sell: 4999000, stock: 6 },
    { name: "Genero Mech Keyboard", sku: "GMK-01", group: accessoriesGroup.id, brand: genero.id, category: accessories.id, cost: 450000, sell: 699000, stock: 40 },
    { name: "Genero Wireless Mouse", sku: "GWM-01", group: accessoriesGroup.id, brand: genero.id, category: accessories.id, cost: 200000, sell: 349000, stock: 60 },
    { name: "Acme USB-C Hub", sku: "AHUB-7", group: accessoriesGroup.id, brand: acme.id, category: accessories.id, cost: 300000, sell: 499000, stock: 25 },
    { name: "Acme Laptop Bag 14\"", sku: "ALB-14", group: accessoriesGroup.id, brand: acme.id, category: accessories.id, cost: 180000, sell: 299000, stock: 0 },
    { name: "A4 Paper Ream 80gsm", sku: "PAPER-A4", group: null, brand: null, category: office.id, cost: 55000, sell: 79000, stock: 100, unit: box.id },
    { name: "Stapler Heavy Duty", sku: "STAP-HD", group: null, brand: null, category: office.id, cost: 65000, sell: 99000, stock: 30 },
    { name: "Installation Service", sku: "SVC-INST", group: null, brand: null, category: null, cost: null, sell: 250000, stock: null, type: "service" as const },
  ];

  const insertedItems = await db
    .insert(schema.items)
    .values(
      itemSeed.map((it) => ({
        name: it.name,
        sku: it.sku,
        type: it.type ?? ("inventory" as const),
        groupId: it.group,
        unitId: it.unit ?? pcs.id,
        brandId: it.brand,
        categoryId: it.category,
        taxId: it.type === "service" ? null : ppn.id,
        costPrice: it.cost,
        sellingPrice: it.sell,
        reorderLevel: 5,
      })),
    )
    .returning();

  // Opening stock movements for inventory items that have stock
  const movements = insertedItems.flatMap((item, i) => {
    const seed = itemSeed[i];
    if (seed.type === "service" || !seed.stock) return [];
    return [
      {
        itemId: item.id,
        warehouseId: mainWarehouse.id,
        quantity: seed.stock,
        sourceType: "opening",
        sourceNumber: null,
      },
    ];
  });
  await db.insert(schema.stockMovements).values(movements);

  // Contacts
  await db.insert(schema.contacts).values([
    {
      type: "customer",
      displayName: "PT Maju Bersama",
      companyName: "PT Maju Bersama",
      email: "purchasing@majubersama.example",
      phone: "+62 21 5555 1111",
      billingCity: "Jakarta",
      billingCountry: "Indonesia",
    },
    {
      type: "customer",
      displayName: "CV Sinar Tech",
      companyName: "CV Sinar Tech",
      email: "order@sinartech.example",
      phone: "+62 22 5555 2222",
      billingCity: "Bandung",
      billingCountry: "Indonesia",
    },
    {
      type: "customer",
      displayName: "Toko Komputer Jaya",
      email: "jaya@tokokomputer.example",
      phone: "+62 31 5555 3333",
      billingCity: "Surabaya",
      billingCountry: "Indonesia",
    },
    {
      type: "vendor",
      displayName: "PT Sumber Elektronik",
      companyName: "PT Sumber Elektronik",
      email: "sales@sumberelektronik.example",
      phone: "+62 21 6666 4444",
      billingCity: "Jakarta",
      billingCountry: "Indonesia",
    },
    {
      type: "vendor",
      displayName: "CV Aksesoris Nusantara",
      email: "info@aksesorisnusantara.example",
      phone: "+62 274 777 888",
      billingCity: "Yogyakarta",
      billingCountry: "Indonesia",
    },
  ]);

  // Numbering series for every module
  await db.insert(schema.numberingSeries).values(
    NUMBERING_MODULES.map((m) => ({
      module: m.module,
      prefix: m.prefix,
      nextNumber: 1,
      padding: 5,
    })),
  );

  // Roles + user
  const [admin] = await db
    .insert(schema.roles)
    .values([{ name: "Admin", description: "Full access" }])
    .returning();
  await db.insert(schema.users).values({
    name: "Fahmi Arif",
    email: "fahmi@genero.example",
    roleId: admin.id,
  });

  console.log(
    `Seeded: ${insertedItems.length} items, ${movements.length} opening movements, 5 contacts, 2 warehouses.`,
  );
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
