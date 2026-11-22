import { CreditNotesList } from "@/components/office/transactions/credit-note-views";
import { api } from "@/lib/api-client";

type DocRow = {
  id: string;
  number: string;
  date: string;
  status: "open" | "closed" | "void";
  customerName: string | null;
  total: number;
};

export default async function CreditNotesPage() {
  const rows = await api.get<DocRow[]>("/credit-notes");

  return <CreditNotesList data={rows} title="Credit Notes" />;
}
