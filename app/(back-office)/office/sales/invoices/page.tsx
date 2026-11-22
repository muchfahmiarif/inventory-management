import { InvoicesList } from "@/components/office/transactions/invoice-views";
import { api } from "@/lib/api-client";

type DocRow = {
  id: string;
  number: string;
  date: string;
  status: "draft" | "sent" | "void" | "partially_paid" | "paid" | "overdue";
  customerName: string | null;
  total: number;
};

export default async function InvoicesPage() {
  const rows = await api.get<DocRow[]>("/invoices");

  return <InvoicesList data={rows} title="Invoices" />;
}
