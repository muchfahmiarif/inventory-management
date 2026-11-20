"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

import {
  deleteCreditNote,
  deleteCreditNotes,
  setCreditNoteStatus,
} from "@/actions/credit-notes";
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

const STATUSES = ["open", "closed", "void"] as const;
export type CreditNoteStatus = (typeof STATUSES)[number];

const STATUS_BADGE: Record<CreditNoteStatus, "outline" | "secondary" | "destructive"> = {
  open: "secondary",
  closed: "secondary",
  void: "destructive",
};

export interface CreditNoteRow {
  id: string;
  number: string;
  date: string;
  status: CreditNoteStatus;
  customerName: string | null;
  total: number;
}

function CreditNotesList({ data, title }: { data: CreditNoteRow[]; title: string }) {
  const router = useRouter();

  const columns: ColumnDef<DataTableFeatures, CreditNoteRow, unknown>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      accessorKey: "number",
      header: "Credit Note #",
      cell: ({ row }) => (
        <Link
          href={`/office/sales/credit-notes/${row.original.id}`}
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
          <Button size={"sm"} onClick={() => router.push("/office/sales/credit-notes/new")}>
            New
          </Button>
        }
      />
      <div className="mx-2">
        <DataTable
          columns={columns}
          data={data}
          getRowId={(row) => row.id}
          emptyMessage="No credit notes yet"
          bulkActions={(ids, clear) => (
            <Button
              size="sm"
              variant="destructive"
              onClick={async () => {
                if (window.confirm(`Delete ${ids.length} credit note(s)?`)) {
                  await deleteCreditNotes(ids);
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

export interface CreditNoteDetailData {
  id: string;
  number: string;
  date: string;
  status: CreditNoteStatus;
  reference: string | null;
  notes: string | null;
  customerName: string;
  total: number;
  lines: Array<{
    id: string;
    itemName: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
}

function CreditNoteDetail({ data }: { data: CreditNoteDetailData }) {
  const router = useRouter();

  return (
    <DetailPageShell
      title={data.number}
      subtitle={`${data.customerName} · ${formatDate(data.date)}`}
      status={data.status.charAt(0).toUpperCase() + data.status.slice(1)}
      statusVariant={STATUS_BADGE[data.status]}
      actionsMenu={
        <>
          <DropdownMenuLabel>Mark as</DropdownMenuLabel>
          {STATUSES.filter((s) => s !== data.status).map((s) => (
            <DropdownMenuItem key={s} onClick={() => setCreditNoteStatus(data.id, s)}>
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
                <AlertDialogTitle>Delete credit note?</AlertDialogTitle>
                <AlertDialogDescription>
                  Permanently delete {data.number}?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteCreditNote(data.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      }
    >
      <div className="mt-4 rounded-md border">
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
    </DetailPageShell>
  );
}

export { CreditNotesList, CreditNoteDetail };
