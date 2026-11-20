import { asc, eq } from "drizzle-orm";

import SalesReturnForm from "@/components/office/transactions/sales-return-form";
import { db } from "@/db";
import { contacts, items, warehouses } from "@/db/schema";

export default async function NewSalesReturnPage() {
  const [contactRows, warehouseRows, itemRows] = await Promise.all([
    db
      .select({ id: contacts.id, name: contacts.displayName })
      .from(contacts)
      .where(eq(contacts.type, "customer"))
      .orderBy(asc(contacts.displayName)),
    db
      .select({ id: warehouses.id, name: warehouses.name })
      .from(warehouses)
      .orderBy(asc(warehouses.name)),
    db
      .select({ id: items.id, name: items.name, sellingPrice: items.sellingPrice })
      .from(items)
      .orderBy(asc(items.name)),
  ]);

  return (
    <SalesReturnForm
      defaultValues={{
        date: new Date().toISOString().slice(0, 10),
        contactId: "",
        warehouseId: warehouseRows[0]?.id ?? "",
        lines: [{ itemId: "", quantity: "1", rate: "0" }],
      }}
      contacts={contactRows}
      warehouses={warehouseRows}
      items={itemRows}
    />
  );
}
