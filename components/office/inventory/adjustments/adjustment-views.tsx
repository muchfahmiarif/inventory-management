"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

import { deleteAdjustments } from "@/actions/adjustments";
import DetailPageShell from "@/components/shared/detail-page";
import CustomViewsDropdown, {
  CustomView,
} from "@/components/shared/custom-views-dropdown";
import DataTable, {
  DataTableFeatures,
} from "@/components/shared/data-table";
import KebabMenu from "@/components/shared/kebab-menu";
import ListToolbar from "@/components/shared/list-toolbar";
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
import { formatDate, formatQty } from "@/lib/format";

// ---------- list ----------

export interface AdjustmentRow {
  id: string;
  number: string;
  date: string;
  reference: string | null;
  reason: string | null;
  warehouseName: string | null;
}

const CUSTOM_VIEWS: CustomView[] = [{ name: "All Adjustments", value: "all" }];

export function AdjustmentsList({ data, title }: { data: AdjustmentRow[]; title: string }) {
  const router = useRouter();

  const columns: ColumnDef<DataTableFeatures, AdjustmentRow, unknown>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      accessorKey: "number",
      header: "Reference #",
      cell: ({ row }) => (
        <Link
          href={`/office/inventory/adjustments/${row.original.id}`}
          className="font-medium hover:text-primary hover:underline"
        >
          {row.original.number}
        </Link>
      ),
    },
    {
      accessorKey: "warehouseName",
      header: "Warehouse",
      cell: ({ row }) => row.original.warehouseName ?? "-",
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => (
        <span className="line-clamp-1 text-muted-foreground">
          {row.original.reason ?? "-"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: () => <Badge variant="secondary">Approved</Badge>,
    },
  ];

  return (
    <div className="flex flex-col gap-2 px-2 pb-8">
      <ListToolbar
        className="sticky top-0 mx-2 my-4"
        left={
          <CustomViewsDropdown title={title} views={CUSTOM_VIEWS} selected="all" />
        }
        right={
          <>
            <Button
              className="flex flex-row"
              size={"sm"}
              onClick={() => router.push("/office/inventory/adjustments/new")}
            >
              New
            </Button>
            <KebabMenu moduleLabel="Adjustments" onRefresh={() => router.refresh()} />
          </>
        }
      />
      <div className="mx-2">
        <DataTable
          columns={columns}
          data={data}
          getRowId={(row) => row.id}
          emptyMessage="No inventory adjustments yet"
          bulkActions={(ids, clear) => (
            <Button
              size="sm"
              variant="destructive"
              onClick={async () => {
                if (window.confirm(`Delete ${ids.length} adjustment(s)? Stock is reversed.`)) {
                  await deleteAdjustments(ids);
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

export interface AdjustmentDetailData {
  id: string;
  number: string;
  date: string;
  reference: string | null;
  reason: string | null;
  warehouseName: string | null;
  lines: Array<{
    id: string;
    itemName: string;
    sku: string | null;
    systemQuantity: number;
    adjustedQuantity: number;
  }>;
}

export function AdjustmentDetail({ data }: { data: AdjustmentDetailData }) {
  const router = useRouter();

  return (
    <DetailPageShell
      title={data.number}
      subtitle={formatDate(data.date)}
      status="Approved"
      actionsMenu={null}
    >
      <div className="mt-4 flex flex-col gap-4">
        <div className="rounded-md border">
          <div className="rounded-t-md border-b bg-zinc-100 px-4 py-2 text-sm font-medium dark:bg-muted">
            Adjustment Details
          </div>
          <div className="grid grid-cols-1 gap-2 p-4 text-sm md:grid-cols-2">
            <p>
              <span className="text-muted-foreground">Warehouse: </span>
              {data.warehouseName ?? "-"}
            </p>
            <p>
              <span className="text-muted-foreground">Reference #: </span>
              {data.reference ?? "-"}
            </p>
            <p className="md:col-span-2">
              <span className="text-muted-foreground">Reason: </span>
              {data.reason ?? "-"}
            </p>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">System Qty</TableHead>
                <TableHead className="text-right">Adjusted Qty</TableHead>
                <TableHead className="text-right">Difference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.lines.map((line) => {
                const diff = line.adjustedQuantity - line.systemQuantity;
                return (
                  <TableRow key={line.id}>
                    <TableCell>{line.itemName}</TableCell>
                    <TableCell className="text-right">
                      {formatQty(line.systemQuantity)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatQty(line.adjustedQuantity)}
                    </TableCell>
                    <TableCell
                      className={`text-right ${
                        diff > 0 ? "text-green-600" : diff < 0 ? "text-red-500" : ""
                      }`}
                    >
                      {diff > 0 ? "+" : ""}
                      {formatQty(diff)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div>
          <Button variant="outline" size="sm" onClick={() => router.push(PATH_LIST)}>
            Back to Adjustments
          </Button>
        </div>
      </div>
    </DetailPageShell>
  );
}

const PATH_LIST = "/office/inventory/adjustments";
