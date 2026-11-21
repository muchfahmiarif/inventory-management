"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PackageCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

import { toast } from "sonner";

import {
  deletePurchaseOrder,
  deletePurchaseOrders,
  receivePurchaseOrderItems,
  setPurchaseOrderStatus,
} from "@/actions/purchase-orders";
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
  DropdownMenuSeparator,
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

export const PO_STATUSES = [
  "draft",
  "open",
  "partially_received",
  "received",
  "billed",
  "cancelled",
] as const;

export type POStatus = (typeof PO_STATUSES)[number];

const STATUS_BADGE: Record<POStatus, "outline" | "secondary" | "default" | "destructive"> = {
  draft: "outline",
  open: "secondary",
  partially_received: "secondary",
  received: "default",
  billed: "default",
  cancelled: "destructive",
};

// ---------- list ----------

export interface PurchaseOrderRow {
  id: string;
  number: string;
  date: string;
  status: POStatus;
  vendorName: string | null;
  total: number;
}

function PurchaseOrdersList({ data, title }: { data: PurchaseOrderRow[]; title: string }) {
  const router = useRouter();

  const columns: ColumnDef<DataTableFeatures, PurchaseOrderRow, unknown>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      accessorKey: "number",
      header: "Purchase Order #",
      cell: ({ row }) => (
        <Link
          href={`/office/purchases/purchase-orders/${row.original.id}`}
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
        <Badge variant={STATUS_BADGE[row.original.status]}>
          <span className="capitalize">{row.original.status.replace("_", " ")}</span>
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
          <Button
            size={"sm"}
            onClick={() => router.push("/office/purchases/purchase-orders/new")}
          >
            New
          </Button>
        }
      />
      <div className="mx-2">
        <DataTable
          columns={columns}
          data={data}
          getRowId={(row) => row.id}
          emptyMessage="No purchase orders yet"
          bulkActions={(ids, clear) => (
            <Button
              size="sm"
              variant="destructive"
              onClick={async () => {
                if (window.confirm(`Delete ${ids.length} purchase order(s)?`)) {
                  await deletePurchaseOrders(ids);
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

export interface PurchaseOrderDetailData {
  id: string;
  number: string;
  date: string;
  expectedDeliveryDate: string | null;
  status: POStatus;
  reference: string | null;
  notes: string | null;
  terms: string | null;
  vendorName: string;
  warehouseName: string | null;
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

function PurchaseOrderDetail({ data }: { data: PurchaseOrderDetailData }) {
  const router = useRouter();
  const receivable = !["received", "billed", "cancelled", "draft"].includes(
    data.status,
  );

  return (
    <DetailPageShell
      title={data.number}
      subtitle={`${data.vendorName} · ${formatDate(data.date)}`}
      status={data.status.replace("_", " ").charAt(0).toUpperCase() + data.status.replace("_", " ").slice(1)}
      statusVariant={STATUS_BADGE[data.status]}
      primaryActionLabel="Edit"
      onPrimaryAction={() => router.push(`/office/purchases/purchase-orders/${data.id}/edit`)}
      actionsMenu={
        <>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => receivePurchaseOrderItems(data.id)}>
            <PackageCheck className="mr-2 h-4 w-4" />
            Receive Items (stock in)
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setPurchaseOrderStatus(data.id, "cancelled")}>
            Cancel Order
          </DropdownMenuItem>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Delete
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete purchase order?</AlertDialogTitle>
                <AlertDialogDescription>
                  Permanently delete {data.number}? This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deletePurchaseOrder(data.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      }
    >
      <div className="mt-4 flex flex-col gap-4">
        {receivable && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={async () => {
                await receivePurchaseOrderItems(data.id);
                toast.success("Items received — stock updated");
              }}
            >
              <PackageCheck className="mr-1 h-4 w-4" /> Receive Items
            </Button>
            <span className="text-sm text-muted-foreground">
              stock in → {data.warehouseName ?? "-"}
            </span>
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

export { PurchaseOrdersList, PurchaseOrderDetail };
