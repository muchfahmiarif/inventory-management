import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { DebitNoteDetail } from "@/components/office/transactions/debit-note-views";
import { db } from "@/db";
import { contacts, debitNoteLines, debitNotes } from "@/db/schema";

export default async function DebitNoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [note] = await db
    .select({
      id: debitNotes.id,
      number: debitNotes.number,
      date: debitNotes.date,
      status: debitNotes.status,
      reference: debitNotes.reference,
      notes: debitNotes.notes,
      total: debitNotes.total,
      vendorName: contacts.displayName,
    })
    .from(debitNotes)
    .leftJoin(contacts, eq(debitNotes.contactId, contacts.id))
    .where(eq(debitNotes.id, id));

  if (!note) notFound();

  const lines = await db
    .select({
      id: debitNoteLines.id,
      itemName: debitNoteLines.name,
      quantity: debitNoteLines.quantity,
      rate: debitNoteLines.rate,
      amount: debitNoteLines.amount,
    })
    .from(debitNoteLines)
    .where(eq(debitNoteLines.debitNoteId, id))
    .orderBy(asc(debitNoteLines.id));

  return (
    <DebitNoteDetail
      data={{
        ...note,
        vendorName: note.vendorName ?? "Unknown",
        lines: lines.map((l) => ({
          ...l,
          quantity: Number(l.quantity),
          rate: Number(l.rate),
          amount: Number(l.amount),
        })),
      }}
    />
  );
}
