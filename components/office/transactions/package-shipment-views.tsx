"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Send, Truck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

import { deletePackage } from "@/actions/packages";
import {
  deleteShipment,
  markShipmentDelivered,
} from "@/actions/shipments";
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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatMoney, formatQty } from "@/lib/format";

// ---------- packages list ----------

export interface PackageRow {
  id: string;
  number: string;
  date: string;
  status: "draft" | "shipped" | "delivered";
  customerName: string | null;
  salesOrderNumber: string | null;
}

function PackagesList({ data, title }: { data: PackageRow[]; title: string }) {
  const router = useRouter();

  const columns: ColumnDef<DataTableFeatures, PackageRow, unknown>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      accessorKey: "number",
      header: "Package #",
      cell: ({ row }) => (
        <Link
          href={`/office/sales/packages/${row.original.id}`}
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
      accessorKey: "salesOrderNumber",
      header: "Sales Order #",
      cell: ({ row }) => row.original.salesOrderNumber ?? "-",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === "delivered"
              ? "default"
              : row.original.status === "shipped"
                ? "secondary"
                : "outline"
          }
        >
          <span className="capitalize">{row.original.status}</span>
        </Badge>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-2 px-2 pb-8">
      <ListToolbar
        className="sticky top-0 mx-2 my-4"
        left={<h2 className="px-2 text-xl font-medium">{title}</h2>}
        right={
          <Button size={"sm"} onClick={() => router.push("/office/sales/packages/new")}>
            New
          </Button>
        }
      />
      <div className="mx-2">
        <DataTable
          columns={columns}
          data={data}
          getRowId={(row) => row.id}
          emptyMessage="No packages yet — create one from a confirmed sales order"
          bulkActions={(ids, clear) => (
            <Button
              size="sm"
              variant="destructive"
              onClick={async () => {
                if (window.confirm(`Delete ${ids.length} draft package(s)?`)) {
                  await Promise.all(ids.map((id) => deletePackage(id)));
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

// ---------- package detail ----------

export interface PackageDetailData {
  id: string;
  number: string;
  date: string;
  status: "draft" | "shipped" | "delivered";
  notes: string | null;
  customerName: string;
  salesOrderId: string | null;
  salesOrderNumber: string | null;
  warehouseName: string | null;
  lines: Array<{
    id: string;
    itemName: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
}

function PackageDetail({ data }: { data: PackageDetailData }) {
  const router = useRouter();
  const [shipOpen, setShipOpen] = React.useState(false);
  const [carrier, setCarrier] = React.useState("");
  const [tracking, setTracking] = React.useState("");
  const [shipDate, setShipDate] = React.useState(
    new Date().toISOString().slice(0, 10),
  );

  const submitShipment = async () => {
    const { createShipment } = await import("@/actions/shipments");
    await createShipment({
      packageId: data.id,
      date: shipDate,
      carrier: carrier || undefined,
      trackingNumber: tracking || undefined,
    });
    setShipOpen(false);
    router.push(`/office/sales/shipments`);
  };

  return (
    <DetailPageShell
      title={data.number}
      subtitle={`${data.customerName} · ${formatDate(data.date)}`}
      status={data.status.charAt(0).toUpperCase() + data.status.slice(1)}
      statusVariant={
        data.status === "delivered"
          ? "default"
          : data.status === "shipped"
            ? "secondary"
            : "outline"
      }
      actionsMenu={null}
    >
      <div className="mt-4 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          {data.status === "draft" && (
            <>
              <Button size="sm" onClick={() => setShipOpen(true)}>
                <Truck className="mr-1 h-4 w-4" /> Create Shipment
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  if (window.confirm(`Delete draft package ${data.number}?`)) {
                    await deletePackage(data.id);
                  }
                }}
              >
                Delete
              </Button>
            </>
          )}
          {data.salesOrderId && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => router.push(`/office/sales/sales-orders/${data.salesOrderId}`)}
            >
              View Sales Order
            </Button>
          )}
        </div>

        <div className="rounded-md border">
          <div className="rounded-t-md border-b bg-zinc-100 px-4 py-2 text-sm font-medium dark:bg-muted">
            Packed Items — from {data.warehouseName ?? "-"}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Packed Qty</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.lines.map((line) => (
                <TableRow key={line.id}>
                  <TableCell>{line.itemName}</TableCell>
                  <TableCell className="text-right">
                    {formatQty(line.quantity)}
                  </TableCell>
                  <TableCell className="text-right">{formatMoney(line.rate)}</TableCell>
                  <TableCell className="text-right">{formatMoney(line.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={shipOpen} onOpenChange={setShipOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Shipment from {data.number}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Stock will leave <strong>{data.warehouseName ?? "the warehouse"}</strong>{" "}
              for every packed item.
            </p>
            <div className="flex flex-col gap-3 py-2">
              <div>
                <p className="mb-1 text-sm font-medium">Date</p>
                <Input value={shipDate} onChange={(e) => setShipDate(e.target.value)} type="date" />
              </div>
              <div>
                <p className="mb-1 text-sm font-medium">Courier / Carrier</p>
                <Input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="e.g. JNE, J&T, SiCepat" />
              </div>
              <div>
                <p className="mb-1 text-sm font-medium">Tracking Number</p>
                <Input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Optional" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShipOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitShipment}>Create Shipment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DetailPageShell>
  );
}

// ---------- shipments list ----------

export interface ShipmentRow {
  id: string;
  number: string;
  date: string;
  status: "draft" | "shipped" | "delivered";
  customerName: string | null;
  carrier: string | null;
  trackingNumber: string | null;
}

function ShipmentsList({ data, title }: { data: ShipmentRow[]; title: string }) {
  const router = useRouter();

  const columns: ColumnDef<DataTableFeatures, ShipmentRow, unknown>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      accessorKey: "number",
      header: "Shipment #",
      cell: ({ row }) => (
        <Link
          href={`/office/sales/shipments/${row.original.id}`}
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
      accessorKey: "carrier",
      header: "Carrier",
      cell: ({ row }) => row.original.carrier ?? "-",
    },
    {
      accessorKey: "trackingNumber",
      header: "Tracking #",
      cell: ({ row }) => row.original.trackingNumber ?? "-",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === "delivered"
              ? "default"
              : row.original.status === "shipped"
                ? "secondary"
                : "outline"
          }
        >
          <span className="capitalize">{row.original.status}</span>
        </Badge>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-2 px-2 pb-8">
      <ListToolbar
        className="sticky top-0 mx-2 my-4"
        left={<h2 className="px-2 text-xl font-medium">{title}</h2>}
        right={null}
      />
      <div className="mx-2">
        <DataTable
          columns={columns}
          data={data}
          getRowId={(row) => row.id}
          emptyMessage="No shipments yet — create packages from sales orders first"
        />
      </div>
    </div>
  );
}

// ---------- shipment detail ----------

export interface ShipmentDetailData {
  id: string;
  number: string;
  date: string;
  status: "draft" | "shipped" | "delivered";
  carrier: string | null;
  trackingNumber: string | null;
  notes: string | null;
  customerName: string;
  lines: Array<{
    id: string;
    itemName: string;
    quantity: number;
  }>;
}

function ShipmentDetail({ data }: { data: ShipmentDetailData }) {
  const router = useRouter();

  return (
    <DetailPageShell
      title={data.number}
      subtitle={`${data.customerName} · ${formatDate(data.date)}`}
      status={data.status.charAt(0).toUpperCase() + data.status.slice(1)}
      statusVariant={data.status === "delivered" ? "default" : "secondary"}
      actionsMenu={null}
    >
      <div className="mt-4 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          {data.status === "shipped" && (
            <Button size="sm" onClick={() => markShipmentDelivered(data.id)}>
              <CheckCircle2 className="mr-1 h-4 w-4" /> Mark as Delivered
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              if (window.confirm("Delete this shipment? Shipped stock is reversed.")) {
                await deleteShipment(data.id);
              }
            }}
          >
            Delete
          </Button>
          {data.carrier && (
            <span className="ml-2 flex items-center gap-1 text-sm text-muted-foreground">
              <Send className="h-4 w-4" /> {data.carrier}
              {data.trackingNumber ? ` · ${data.trackingNumber}` : ""}
            </span>
          )}
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Shipped Qty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.lines.map((line) => (
                <TableRow key={line.id}>
                  <TableCell>{line.itemName}</TableCell>
                  <TableCell className="text-right">
                    {formatQty(line.quantity)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DetailPageShell>
  );
}

export { PackagesList, PackageDetail, ShipmentsList, ShipmentDetail };
