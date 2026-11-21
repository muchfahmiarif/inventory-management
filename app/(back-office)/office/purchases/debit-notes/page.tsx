import { desc, eq } from "drizzle-orm";

import { DebitNotesList } from "@/components/office/transactions/debit-note-views";
import { db } from "@/db";
import { contacts, debitNotes } from "@/db/schema";

export default async function DebitNotesPage() {
  const rows = await db
    .select({
      id: debitNotes.id,
      number: debitNotes.number,
      date: debitNotes.date,
      status: debitNotes.status,
      vendorName: contacts.displayName,
      total: debitNotes.total,
    })
    .from(debitNotes)
    .leftJoin(contacts, eq(debitNotes.contactId, contacts.id))
    .orderBy(desc(debitNotes.date), desc(debitNotes.createdAt));

  return <DebitNotesList data={rows} title="Debit Notes" />;
}
