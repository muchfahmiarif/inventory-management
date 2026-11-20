"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

import {
  deleteEstimate,
  deleteEstimates,
  setEstimateStatus,
} from "@/actions/estimates";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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

export const ESTIMATE_STATUSES = [
  "draft",
  "sent",
  "viewed",
  "accepted",
  "declined",
  "expired",
] as const;

export type EstimateStatus = (typeof ESTIMATE_STATUSES)[number];

const STATUS_BADGE: Record<EstimateStatus, "outline" | "secondary" | "default" | "destructive"> = {
  draft: "outline",
  sent: "secondary",
  viewed: "secondary",
  accepted: "default",
  declined: "destructive",
  expired: "outline",
};

// ---------- list ----------

export interface EstimateRow {
  id: string;
  number: string;
  date: string;
  status: EstimateStatus;
  customerName: string | null;
  total: number;
}

function EstimatesList({ data, title }: { data: EstimateRow[]; title: string }) {
  const router = useRouter();

  const columns: ColumnDef<DataTableFeatures, EstimateRow, unknown>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      accessorKey: "number",
      header: "Estimate #",
      cell: ({ row }) => (
        <Link
          href={`/office/sales/estimates/${row.original.id}`}
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
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Row actions">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => setEstimateStatus(row.original.id, "sent")}
            >
              Mark as Sent
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setEstimateStatus(row.original.id, "accepted")}
            >
              Mark as Accepted
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setEstimateStatus(row.original.id, "declined")}
            >
              Mark as Declined
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-2 px-2 pb-8">
      <ListToolbar
        className="sticky top-0 mx-2 my-4"
        left={<h2 className="px-2 text-xl font-medium">{title}</h2>}
        right={
          <Button size={"sm"} onClick={() => router.push("/office/sales/estimates/new")}>
            New
          </Button>
        }
      />
      <div className="mx-2">
        <DataTable
          columns={columns}
          data={data}
          getRowId={(row) => row.id}
          emptyMessage="No estimates yet"
          bulkActions={(ids, clear) => (
            <Button
              size="sm"
              variant="destructive"
              onClick={async () => {
                if (window.confirm(`Delete ${ids.length} estimate(s)?`)) {
                  await deleteEstimates(ids);
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

export interface EstimateDetailData {
  id: string;
  number: string;
  date: string;
  expiryDate: string | null;
  status: EstimateStatus;
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
    description: string | null;
    quantity: number;
    rate: number;
    discountPercent: number;
    taxName: string | null;
    amount: number;
  }>;
}

function EstimateDetail({ data }: { data: EstimateDetailData }) {
  const router = useRouter();

  return (
    <DetailPageShell
      title={data.number}
      subtitle={`${data.customerName} · ${formatDate(data.date)}`}
      status={data.status.charAt(0).toUpperCase() + data.status.slice(1)}
      statusVariant={STATUS_BADGE[data.status]}
      primaryActionLabel="Edit"
      onPrimaryAction={() => router.push(`/office/sales/estimates/${data.id}/edit`)}
      actionsMenu={
        <>
          {ESTIMATE_STATUSES.filter((s) => s !== data.status).map((s) => (
            <DropdownMenuItem key={s} onClick={() => setEstimateStatus(data.id, s)}>
              Mark as <span className="capitalize">{s}</span>
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
                <AlertDialogTitle>Delete estimate?</AlertDialogTitle>
                <AlertDialogDescription>
                  Permanently delete {data.number}? This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteEstimate(data.id)}>
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
                <TableHead className="text-right">Disc %</TableHead>
                <TableHead className="text-right">Tax</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.lines.map((line) => (
                <TableRow key={line.id}>
                  <TableCell>
                    <p className="font-medium">{line.itemName}</p>
                    {line.description && (
                      <p className="text-xs text-muted-foreground">{line.description}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{line.quantity}</TableCell>
                  <TableCell className="text-right">{formatMoney(line.rate)}</TableCell>
                  <TableCell className="text-right">{line.discountPercent}%</TableCell>
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

        {(data.notes || data.terms) && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {data.notes && (
              <div className="rounded-md border p-4 text-sm">
                <p className="mb-1 font-medium">Notes</p>
                {data.notes}
              </div>
            )}
            {data.terms && (
              <div className="rounded-md border p-4 text-sm">
                <p className="mb-1 font-medium">Terms & Conditions</p>
                {data.terms}
              </div>
            )}
          </div>
        )}
      </div>
    </DetailPageShell>
  );
}

export { EstimatesList, EstimateDetail };
