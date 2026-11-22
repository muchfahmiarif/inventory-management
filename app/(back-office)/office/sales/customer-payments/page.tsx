import { api } from "@/lib/api-client";
import { formatMoney, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import ListToolbar from "@/components/shared/list-toolbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PaymentRow = {
  id: string;
  number: string;
  date: string;
  customerName: string | null;
  invoiceNumber: string | null;
  mode: string | null;
  amount: number;
};

export default async function CustomerPaymentsPage() {
  const rows = await api.get<PaymentRow[]>("/invoices/payments");

  return (
    <div className="flex flex-col gap-2 px-2 pb-8">
      <ListToolbar
        className="sticky top-0 mx-2 my-4"
        left={<h2 className="px-2 text-xl font-medium">Customer Payments</h2>}
        right={null}
      />
      <div className="mx-2 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Payment #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Invoice #</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{formatDate(row.date)}</TableCell>
                  <TableCell className="font-medium">{row.number}</TableCell>
                  <TableCell>{row.customerName ?? "-"}</TableCell>
                  <TableCell>{row.invoiceNumber ?? "-"}</TableCell>
                  <TableCell>
                    {row.mode ? <Badge variant="secondary">{row.mode.replace("_", " ")}</Badge> : "-"}
                  </TableCell>
                  <TableCell className="text-right">{formatMoney(row.amount)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No payments recorded yet — record them from an invoice
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
