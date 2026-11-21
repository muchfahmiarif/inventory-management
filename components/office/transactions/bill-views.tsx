"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

import { toast } from "sonner";

import { deleteBill, recordBillPayment } from "@/actions/bills";
import DetailPageShell from "@/components/shared/detail-page";
import DataTable, {
  DataTableFeatures,
} from "@/components/shared/data-table";
import ListToolbar from "@/components/shared/list-toolbar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatMoney } from "@/lib/format";

const BILL_STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  open: "Open",
  partially_paid: "Partially Paid",
  paid: "Paid",
  overdue: "Overdue",
  void: "Void",
};

// ---------- list ----------

export interface BillRow {
  id: string;
  number: string;
  date: string;
  status: string;
  vendorName: string | null;
  total: number;
}

function BillsList({ data, title }: { data: BillRow[]; title: string }) {
  const router = useRouter();

  const columns: ColumnDef<DataTableFeatures, BillRow, unknown>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      accessorKey: "number",
      header: "Bill #",
      cell: ({ row }) => (
        <Link
          href={`/office/purchases/bills/${row.original.id}`}
          className="font-medium hover:text-primary hover:underline"
        >
          {row.original.number}
        </Link>
      ),
    },
    {
      accessorKey: "vendorName",
      header: "Vendor Name",
      cell: ({ row }) => row.original.vendorName ?? "-",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === "paid"
              ? "default"
              : row.original.status === "void"
                ? "destructive"
                : "secondary"
          }
        >
          {BILL_STATUS_LABEL[row.original.status] ?? row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "total",
      header: "Amount",
      cell: ({ row }) => formatMoney(row.original.total),
    },
  ];

  return (
    <div className="flex flex-col gap-2 px-2 pb-8">
      <ListToolbar
        className="sticky top-0 mx-2 my-4"
        left={<h2 className="px-2 text-xl font-medium">{title}</h2>}
        right={
          <Button size={"sm"} onClick={() => router.push("/office/purchases/bills/new")}>
            New
          </Button>
        }
      />
      <div className="mx-2">
        <DataTable
          columns={columns}
          data={data}
          getRowId={(row) => row.id}
          emptyMessage="No bills yet"
          bulkActions={(ids, clear) => (
            <Button
              size="sm"
              variant="destructive"
              onClick={async () => {
                if (window.confirm(`Delete ${ids.length} bill(s)?`)) {
                  await Promise.all(ids.map((id) => deleteBill(id)));
                  clear();
                }
              }}
            >
              Delete
            </Button>
          )}
        />
      </div>
    </div>
  );
}

// ---------- detail ----------

export interface BillDetailData {
  id: string;
  number: string;
  date: string;
  dueDate: string | null;
  status: string;
  reference: string | null;
  notes: string | null;
  terms: string | null;
  vendorName: string;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  amountPaid: number;
  lines: Array<{
    id: string;
    itemName: string;
    quantity: number;
    rate: number;
    taxName: string | null;
    amount: number;
  }>;
}

function BillDetail({ data }: { data: BillDetailData }) {
  const router = useRouter();
  const [payOpen, setPayOpen] = React.useState(false);
  const [payAmount, setPayAmount] = React.useState(String(data.total - data.amountPaid));
  const [payMode, setPayMode] = React.useState("bank_transfer");
  const [payDate, setPayDate] = React.useState(new Date().toISOString().slice(0, 10));

  const balance = data.total - data.amountPaid;

  const submitPayment = async () => {
    await recordBillPayment(data.id, {
      amount: Number(payAmount),
      mode: payMode,
      date: payDate,
    });
    setPayOpen(false);
    toast.success("Payment recorded");
    router.refresh();
  };

  return (
    <DetailPageShell
      title={data.number}
      subtitle={`${data.vendorName} · ${formatDate(data.date)}${data.dueDate ? ` · Due ${formatDate(data.dueDate)}` : ""}`}
      status={BILL_STATUS_LABEL[data.status] ?? data.status}
      statusVariant={
        data.status === "paid"
          ? "default"
          : data.status === "void"
            ? "destructive"
            : "secondary"
      }
      primaryActionLabel="Edit"
      onPrimaryAction={() => router.push(`/office/purchases/bills/${data.id}/edit`)}
      actionsMenu={
        <>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Delete
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete bill?</AlertDialogTitle>
                <AlertDialogDescription>
                  Permanently delete {data.number}?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteBill(data.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      }
    >
      <div className="mt-4 flex flex-col gap-4">
        {data.status !== "paid" && (
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setPayOpen(true)}>
              Record Payment
            </Button>
          </div>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Tax</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.lines.map((line) => (
                <TableRow key={line.id}>
                  <TableCell>{line.itemName}</TableCell>
                  <TableCell className="text-right">{line.quantity}</TableCell>
                  <TableCell className="text-right">{formatMoney(line.rate)}</TableCell>
                  <TableCell className="text-right">{line.taxName ?? "-"}</TableCell>
                  <TableCell className="text-right">{formatMoney(line.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end">
          <div className="w-72 rounded-md border p-4 text-sm">
            <p className="flex justify-between py-1">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatMoney(data.subtotal)}</span>
            </p>
            <p className="flex justify-between py-1">
              <span className="text-muted-foreground">Discount</span>
              <span>-{formatMoney(data.discountTotal)}</span>
            </p>
            <p className="flex justify-between py-1">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatMoney(data.taxTotal)}</span>
            </p>
            <p className="flex justify-between py-1 font-medium">
              <span>Total</span>
              <span>{formatMoney(data.total)}</span>
            </p>
            <p className="flex justify-between py-1 text-green-600">
              <span>Amount Paid</span>
              <span>{formatMoney(data.amountPaid)}</span>
            </p>
            <p className="flex justify-between border-t py-1 font-medium">
              <span>Balance Due</span>
              <span>{formatMoney(balance)}</span>
            </p>
          </div>
        </div>

        <Dialog open={payOpen} onOpenChange={setPayOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment for {data.number}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3 py-2">
              <div>
                <p className="mb-1 text-sm font-medium">Amount</p>
                <Input value={payAmount} onChange={(e) => setPayAmount(e.target.value)} type="number" min={0} />
              </div>
              <div>
                <p className="mb-1 text-sm font-medium">Payment Mode</p>
                <Select value={payMode} onValueChange={setPayMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium">Date</p>
                <Input value={payDate} onChange={(e) => setPayDate(e.target.value)} type="date" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPayOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitPayment}>Save Payment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DetailPageShell>
  );
}

export { BillsList, BillDetail };
