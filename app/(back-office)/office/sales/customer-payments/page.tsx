import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { contacts, customerPayments, invoices } from "@/db/schema";
import { formatMoney } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import ListToolbar from "@/components/shared/list-toolbar";

export default async function CustomerPaymentsPage() {
  const rows = await db
    .select({
      id: customerPayments.id,
      number: customerPayments.number,
      date: customerPayments.date,
      customerName: contacts.displayName,
      invoiceNumber: invoices.number,
      mode: customerPayments.mode,
      amount: customerPayments.amount,
    })
    .from(customerPayments)
    .leftJoin(contacts, eq(customerPayments.contactId, contacts.id))
    .leftJoin(invoices, eq(customerPayments.invoiceId, invoices.id))
    .orderBy(desc(customerPayments.date), desc(customerPayments.createdAt));

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
