"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

import {
  deleteSalesReturn,
  deleteSalesReturns,
  markSalesReturnReceived,
} from "@/actions/sales-returns";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatMoney } from "@/lib/format";

export interface SalesReturnRow {
  id: string;
  number: string;
  date: string;
  status: "draft" | "received" | "cancelled";
  customerName: string | null;
  total: number;
}

function SalesReturnsList({ data, title }: { data: SalesReturnRow[]; title: string }) {
  const router = useRouter();

  const columns: ColumnDef<DataTableFeatures, SalesReturnRow, unknown>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      accessorKey: "number",
      header: "Return #",
      cell: ({ row }) => (
        <Link
          href={`/office/sales/sales-returns/${row.original.id}`}
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
        <Badge
          variant={
            row.original.status === "received"
              ? "default"
              : row.original.status === "cancelled"
                ? "destructive"
                : "outline"
          }
        >
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
          <Button size={"sm"} onClick={() => router.push("/office/sales/sales-returns/new")}>
            New
          </Button>
        }
      />
      <div className="mx-2">
        <DataTable
          columns={columns}
          data={data}
          getRowId={(row) => row.id}
          emptyMessage="No sales returns yet"
          bulkActions={(ids, clear) => (
            <Button
              size="sm"
              variant="destructive"
              onClick={async () => {
                if (window.confirm(`Delete ${ids.length} sales return(s)? Received stock is reversed.`)) {
                  await Promise.all(ids.map((id) => deleteSalesReturn(id)));
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

export interface SalesReturnDetailData {
  id: string;
  number: string;
  date: string;
  status: "draft" | "received" | "cancelled";
  reference: string | null;
  notes: string | null;
  customerName: string;
  warehouseName: string | null;
  total: number;
  lines: Array<{
    id: string;
    itemName: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
}

function SalesReturnDetail({ data }: { data: SalesReturnDetailData }) {
  const router = useRouter();

  return (
    <DetailPageShell
      title={data.number}
      subtitle={`${data.customerName} · ${formatDate(data.date)}`}
      status={data.status.charAt(0).toUpperCase() + data.status.slice(1)}
      statusVariant={data.status === "received" ? "default" : data.status === "cancelled" ? "destructive" : "outline"}
      actionsMenu={null}
    >
      <div className="mt-4 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          {data.status === "draft" && (
            <Button size="sm" onClick={() => markSalesReturnReceived(data.id)}>
              Mark as Received
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              if (window.confirm("Delete this sales return? Received stock is reversed.")) {
                await deleteSalesReturn(data.id);
              }
            }}
          >
            Delete
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.lines.map((line) => (
                <TableRow key={line.id}>
                  <TableCell>{line.itemName}</TableCell>
                  <TableCell className="text-right">{line.quantity}</TableCell>
                  <TableCell className="text-right">{formatMoney(line.rate)}</TableCell>
                  <TableCell className="text-right">{formatMoney(line.amount)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} className="text-right font-medium">
                  Total
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatMoney(data.total)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </DetailPageShell>
  );
}

export { SalesReturnsList, SalesReturnDetail };
