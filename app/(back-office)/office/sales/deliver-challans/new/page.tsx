import { asc, eq } from "drizzle-orm";

import TransactionForm from "@/components/office/transactions/transaction-form";
import { createDeliverChallan } from "@/actions/deliver-challans";
import { db } from "@/db";
import { contacts, items, taxes } from "@/db/schema";

export default async function NewDeliverChallanPage() {
  const [contactRows, itemRows, taxRows] = await Promise.all([
    db
      .select({ id: contacts.id, name: contacts.displayName })
      .from(contacts)
      .where(eq(contacts.type, "customer"))
      .orderBy(asc(contacts.displayName)),
    db
      .select({ id: items.id, name: items.name, sellingPrice: items.sellingPrice })
      .from(items)
      .orderBy(asc(items.name)),
    db.select({ id: taxes.id, name: taxes.name, rate: taxes.rate }).from(taxes).orderBy(asc(taxes.name)),
  ]);

  return (
    <TransactionForm
      mode="new"
      title="New Deliver Challan"
      contactLabel="Customer"
      submitAction={createDeliverChallan}
      defaultValues={{
        date: new Date().toISOString().slice(0, 10),
        contactId: "",
        lines: [{ itemId: "", quantity: "1", rate: "0", discountPercent: "0", taxId: "none" }],
      }}
      contacts={contactRows}
      items={itemRows}
      taxes={taxRows}
    />
  );
}
