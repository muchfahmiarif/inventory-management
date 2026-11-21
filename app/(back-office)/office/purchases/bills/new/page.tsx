import { asc, eq } from "drizzle-orm";
import { purchaseOrders as purchaseOrdersTable } from "@/db/schema";

import TransactionForm from "@/components/office/transactions/transaction-form";
import { createBill } from "@/actions/bills";
import { db } from "@/db";
import { contacts, items, taxes } from "@/db/schema";

export default async function NewBillPage({
  searchParams,
}: {
  searchParams: Promise<{ poId?: string }>;
}) {
  const { poId } = await searchParams;

  const [contactRows, itemRows, taxRows] = await Promise.all([
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
  ]);

  let prefill: Record<string, unknown> = {};
  if (poId) {
    const [po] = await db
      .select()
      .from(purchaseOrdersTable)
      .where(eq(purchaseOrdersTable.id, poId));
    if (po) {
      prefill = { contactId: po.contactId, reference: po.number };
    }
  }

  return (
    <TransactionForm
      mode="new"
      title="New Bill"
      contactLabel="Vendor"
      submitAction={createBill}
      defaultValues={{
        date: new Date().toISOString().slice(0, 10),
        contactId: "",
        expiryDate: "",
        lines: [{ itemId: "", quantity: "1", rate: "0", discountPercent: "0", taxId: "none" }],
        ...prefill,
      }}
      contacts={contactRows}
      items={itemRows}
      taxes={taxRows}
      extraDateLabel="Due Date"
      extraDateKey="expiryDate"
    />
  );
}

