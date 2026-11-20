"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

import { deleteSalesOrder, deleteSalesOrders, setSalesOrderStatus } from "@/actions/sales-orders";
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
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatMoney } from "@/lib/format";

export const SO_STATUSES = [
  "draft",
  "confirmed",
  "packed",
  "shipped",
  "invoiced",
  "fulfilled",
  "cancelled",
] as const;

export type SOStatus = (typeof SO_STATUSES)[number];

const STATUS_BADGE: Record<SOStatus, "outline" | "secondary" | "default" | "destructive"> = {
  draft: "outline",
  confirmed: "secondary",
  packed: "secondary",
  shipped: "default",
  invoiced: "default",
  fulfilled: "default",
  cancelled: "destructive",
};

// ---------- list ----------

export interface SalesOrderRow {
  id: string;
  number: string;
  date: string;
  status: SOStatus;
  customerName: string | null;
  total: number;
}

function SalesOrdersList({ data, title }: { data: SalesOrderRow[]; title: string }) {
  const router = useRouter();

  const columns: ColumnDef<DataTableFeatures, SalesOrderRow, unknown>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      accessorKey: "number",
      header: "Sales Order #",
      cell: ({ row }) => (
        <Link
          href={`/office/sales/sales-orders/${row.original.id}`}
          className="font-medium hover:text-primary hover:underline"
        >
          {row.original.number}
        </Link>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Customer Name",
      cell: ({ row }) => row.original.customerName ?? "-",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={STATUS_BADGE[row.original.status]}>
          <span className="capitalize">{row.original.status}</span>
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
          <Button size={"sm"} onClick={() => router.push("/office/sales/sales-orders/new")}>
            New
          </Button>
        }
      />
      <div className="mx-2">
        <DataTable
          columns={columns}
          data={data}
          getRowId={(row) => row.id}
          emptyMessage="No sales orders yet"
          bulkActions={(ids, clear) => (
            <Button
              size="sm"
              variant="destructive"
              onClick={async () => {
                if (window.confirm(`Delete ${ids.length} sales order(s)?`)) {
                  await deleteSalesOrders(ids);
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

export interface SalesOrderDetailData {
  id: string;
  number: string;
  date: string;
  expectedShipmentDate: string | null;
  status: SOStatus;
  reference: string | null;
  notes: string | null;
  terms: string | null;
  customerName: string;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  lines: Array<{
    id: string;
    itemName: string;
    quantity: number;
    rate: number;
    taxName: string | null;
    amount: number;
  }>;
}

function SalesOrderDetail({ data }: { data: SalesOrderDetailData }) {
  const router = useRouter();

  return (
    <DetailPageShell
      title={data.number}
      subtitle={`${data.customerName} · ${formatDate(data.date)}`}
      status={data.status.charAt(0).toUpperCase() + data.status.slice(1)}
      statusVariant={STATUS_BADGE[data.status]}
      primaryActionLabel="Edit"
      onPrimaryAction={() => router.push(`/office/sales/sales-orders/${data.id}/edit`)}
      actionsMenu={
        <>
          <DropdownMenuLabel>Mark as</DropdownMenuLabel>
          {SO_STATUSES.filter((s) => s !== data.status).map((s) => (
            <DropdownMenuItem key={s} onClick={() => setSalesOrderStatus(data.id, s)}>
              <span className="capitalize">{s}</span>
            </DropdownMenuItem>
          ))}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Delete
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete sales order?</AlertDialogTitle>
                <AlertDialogDescription>
                  Permanently delete {data.number}? This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteSalesOrder(data.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      }
    >
      <div className="mt-4 flex flex-col gap-4">
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
                  <TableCell>
                    <p className="font-medium">{line.itemName}</p>
                  </TableCell>
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
            <p className="flex justify-between border-t py-1 text-base font-medium">
              <span>Total</span>
              <span>{formatMoney(data.total)}</span>
            </p>
          </div>
        </div>
      </div>
    </DetailPageShell>
  );
}

export { SalesOrdersList, SalesOrderDetail };
