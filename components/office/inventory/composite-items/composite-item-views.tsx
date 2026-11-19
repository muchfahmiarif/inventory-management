"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

import { deleteCompositeItem } from "@/actions/composite-items";
import DetailPageShell from "@/components/shared/detail-page";
import CustomViewsDropdown, {
  CustomView,
} from "@/components/shared/custom-views-dropdown";
import DataTable, {
  DataTableFeatures,
} from "@/components/shared/data-table";
import KebabMenu from "@/components/shared/kebab-menu";
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
import { formatMoney } from "@/lib/format";

export interface CompositeItemRow {
  id: string;
  name: string;
  sku: string | null;
  componentCount: number;
  totalCost: number;
  status: "active" | "inactive";
}

const CUSTOM_VIEWS: CustomView[] = [
  { name: "All Composite Items", value: "all" },
  { name: "Active Composite Items", value: "active" },
  { name: "Inactive Composite Items", value: "inactive" },
];

// ---------- list ----------

interface CompositeItemsListProps {
  data: CompositeItemRow[];
  view: string;
  title: string;
}

export function CompositeItemsList({ data, view, title }: CompositeItemsListProps) {
  const router = useRouter();

  const columns: ColumnDef<DataTableFeatures, CompositeItemRow, unknown>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <Link
          href={`/office/inventory/composite-items/${row.original.id}`}
          className="font-medium hover:text-primary hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    { accessorKey: "sku", header: "Code", cell: ({ row }) => row.original.sku ?? "-" },
    {
      accessorKey: "componentCount",
      header: "Components",
      cell: ({ row }) => row.original.componentCount,
    },
    {
      accessorKey: "totalCost",
      header: "Total Cost",
      cell: ({ row }) => formatMoney(row.original.totalCost),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "active" ? "secondary" : "outline"}>
          {row.original.status === "active" ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-2 px-2 pb-8">
      <ListToolbar
        className="sticky top-0 mx-2 my-4"
        left={
          <CustomViewsDropdown
            title={title}
            views={CUSTOM_VIEWS}
            selected={view}
            onSelect={(v) =>
              router.push(`/office/inventory/composite-items?view=${v.value}`)
            }
          />
        }
        right={
          <>
            <Button
              className="flex flex-row"
              size={"sm"}
              onClick={() => router.push("/office/inventory/composite-items/new")}
            >
              New
            </Button>
            <KebabMenu
              moduleLabel="Composite Items"
              onRefresh={() => router.refresh()}
            />
          </>
        }
      />
      <div className="mx-2">
        <DataTable
          columns={columns}
          data={data}
          getRowId={(row) => row.id}
          emptyMessage="No composite items found"
          bulkActions={(ids, clear) => (
            <Button
              size="sm"
              variant="destructive"
              onClick={async () => {
                if (window.confirm(`Delete ${ids.length} composite item(s)?`)) {
                  await Promise.all(ids.map((id) => deleteCompositeItem(id)));
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

export interface CompositeItemDetailData {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  status: "active" | "inactive";
  unitName: string | null;
  components: Array<{
    id: string;
    itemName: string;
    quantity: number;
    costPrice: number | null;
  }>;
  history: { id: string; action: string; createdAt: string }[];
}

export function CompositeItemDetail({ data }: { data: CompositeItemDetailData }) {
  const router = useRouter();

  const totalCost = data.components.reduce(
    (sum, c) => sum + (c.costPrice ?? 0) * c.quantity,
    0,
  );

  return (
    <DetailPageShell
      title={data.name}
      subtitle={data.sku}
      status={data.status === "active" ? "Active" : "Inactive"}
      statusVariant={data.status === "active" ? "secondary" : "outline"}
      primaryActionLabel="Edit"
      onPrimaryAction={() =>
        router.push(`/office/inventory/composite-items/${data.id}/edit`)
      }
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
                <AlertDialogTitle>Delete composite item?</AlertDialogTitle>
                <AlertDialogDescription>
                  Permanently delete &quot;{data.name}&quot;? This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteCompositeItem(data.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      }
    >
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-md border">
          <div className="rounded-t-md border-b bg-zinc-100 px-4 py-2 text-sm font-medium dark:bg-muted">
            Components
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.components.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.itemName}</TableCell>
                  <TableCell className="text-right">{c.quantity}</TableCell>
                  <TableCell className="text-right">{formatMoney(c.costPrice)}</TableCell>
                  <TableCell className="text-right">
                    {formatMoney((c.costPrice ?? 0) * c.quantity)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} className="text-right font-medium">
                  Total Cost
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatMoney(totalCost)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div className="rounded-md border">
          <div className="rounded-t-md border-b bg-zinc-100 px-4 py-2 text-sm font-medium dark:bg-muted">
            Details
          </div>
          <div className="px-4 py-2 text-sm">
            <p className="py-2">
              <span className="text-muted-foreground">Unit: </span>
              {data.unitName ?? "-"}
            </p>
            <p className="py-2">
              <span className="text-muted-foreground">Description: </span>
              {data.description ?? "-"}
            </p>
          </div>
        </div>
      </div>
    </DetailPageShell>
  );
}
