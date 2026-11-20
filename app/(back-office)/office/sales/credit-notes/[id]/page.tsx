import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { CreditNoteDetail } from "@/components/office/transactions/credit-note-views";
import { db } from "@/db";
import { contacts, creditNoteLines, creditNotes } from "@/db/schema";

export default async function CreditNoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [note] = await db
    .select({
      id: creditNotes.id,
      number: creditNotes.number,
      date: creditNotes.date,
      status: creditNotes.status,
      reference: creditNotes.reference,
      notes: creditNotes.notes,
      total: creditNotes.total,
      customerName: contacts.displayName,
    })
    .from(creditNotes)
    .leftJoin(contacts, eq(creditNotes.contactId, contacts.id))
    .where(eq(creditNotes.id, id));

  if (!note) notFound();

  const lines = await db
    .select({
      id: creditNoteLines.id,
      itemName: creditNoteLines.name,
      quantity: creditNoteLines.quantity,
      rate: creditNoteLines.rate,
      amount: creditNoteLines.amount,
    })
    .from(creditNoteLines)
    .where(eq(creditNoteLines.creditNoteId, id))
    .orderBy(asc(creditNoteLines.id));

  return (
    <CreditNoteDetail
      data={{
        ...note,
        customerName: note.customerName ?? "Unknown",
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
