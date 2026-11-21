import { asc, eq } from "drizzle-orm";

import TransactionForm from "@/components/office/transactions/transaction-form";
import { createPurchaseOrder } from "@/actions/purchase-orders";
import { db } from "@/db";
import { contacts, items, taxes, warehouses } from "@/db/schema";

export default async function NewPurchaseOrderPage() {
  const [contactRows, itemRows, taxRows, warehouseRows] = await Promise.all([
    db
      .select({ id: contacts.id, name: contacts.displayName })
      .from(contacts)
      .where(eq(contacts.type, "vendor"))
      .orderBy(asc(contacts.displayName)),
    db
      .select({ id: items.id, name: items.name, sellingPrice: items.costPrice })
      .from(items)
      .orderBy(asc(items.name)),
    db.select({ id: taxes.id, name: taxes.name, rate: taxes.rate }).from(taxes).orderBy(asc(taxes.name)),
    db
      .select({ id: warehouses.id, name: warehouses.name })
      .from(warehouses)
      .orderBy(asc(warehouses.name)),
  ]);

  return (
    <TransactionForm
      mode="new"
      title="New Purchase Order"
      contactLabel="Vendor"
      submitAction={createPurchaseOrder}
      defaultValues={{
        date: new Date().toISOString().slice(0, 10),
        contactId: "",
        warehouseId: warehouseRows[0]?.id,
        lines: [{ itemId: "", quantity: "1", rate: "0", discountPercent: "0", taxId: "none" }],
      }}
      contacts={contactRows}
      items={itemRows.map((i) => ({ id: i.id, name: i.name, sellingPrice: i.sellingPrice }))}
      taxes={taxRows}
      extraDateLabel="Expected Delivery Date"
      extraDateKey="expiryDate"
      warehouse={{ label: "Deliver To Warehouse", options: warehouseRows }}
    />
  );
}
