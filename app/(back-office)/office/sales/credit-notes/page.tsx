import { desc, eq } from "drizzle-orm";

import { CreditNotesList } from "@/components/office/transactions/credit-note-views";
import { db } from "@/db";
import { contacts, creditNotes } from "@/db/schema";

export default async function CreditNotesPage() {
  const rows = await db
    .select({
      id: creditNotes.id,
      number: creditNotes.number,
      date: creditNotes.date,
      status: creditNotes.status,
      customerName: contacts.displayName,
      total: creditNotes.total,
    })
    .from(creditNotes)
    .leftJoin(contacts, eq(creditNotes.contactId, contacts.id))
    .orderBy(desc(creditNotes.date), desc(creditNotes.createdAt));

  return <CreditNotesList data={rows} title="Credit Notes" />;
}
