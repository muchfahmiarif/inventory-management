import { DebitNotesList } from "@/components/office/transactions/debit-note-views";
import { api } from "@/lib/api-client";

type DebitNoteRow = {
  id: string;
  number: string;
  date: string;
  status: "open" | "closed" | "void";
  vendorName: string | null;
  total: number;
};

export default async function DebitNotesPage() {
  const rows = await api.get<DebitNoteRow[]>("/debit-notes");

  return <DebitNotesList data={rows} title="Debit Notes" />;
}
