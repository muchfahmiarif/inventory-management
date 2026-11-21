import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { bills, contacts, vendorPayments } from "@/db/schema";
import ListToolbar from "@/components/shared/list-toolbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatMoney } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export default async function VendorPaymentsPage() {
  const rows = await db
    .select({
      id: vendorPayments.id,
      number: vendorPayments.number,
      date: vendorPayments.date,
      vendorName: contacts.displayName,
      billNumber: bills.number,
      mode: vendorPayments.mode,
      amount: vendorPayments.amount,
    })
    .from(vendorPayments)
    .leftJoin(contacts, eq(vendorPayments.contactId, contacts.id))
    .leftJoin(bills, eq(vendorPayments.billId, bills.id))
    .orderBy(desc(vendorPayments.date), desc(vendorPayments.createdAt));

  return (
    <div className="flex flex-col gap-2 px-2 pb-8">
      <ListToolbar
        className="sticky top-0 mx-2 my-4"
        left={<h2 className="px-2 text-xl font-medium">Vendor Payments</h2>}
        right={null}
      />
      <div className="mx-2 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Payment #</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Bill #</TableHead>
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
                  <TableCell>{row.vendorName ?? "-"}</TableCell>
                  <TableCell>{row.billNumber ?? "-"}</TableCell>
                  <TableCell>
                    {row.mode ? <Badge variant="secondary">{row.mode.replace("_", " ")}</Badge> : "-"}
                  </TableCell>
                  <TableCell className="text-right">{formatMoney(row.amount)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No vendor payments yet — record them from a bill
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
