"use client";

import {
  ColumnDef,
  columnVisibilityFeature,
  createPaginatedRowModel,
  createSortedRowModel,
  flexRender,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import type { RowData } from "@tanstack/table-core";
import { ArrowLeft, ArrowRight, ArrowUpDown } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// Features + row models are registered once, statically (per TanStack Table v9)
const features = tableFeatures({
  rowSortingFeature,
  rowSelectionFeature,
  rowPaginationFeature,
  columnVisibilityFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric },
});

type Features = typeof features;

// Exported so pages can type their column defs against the same feature set
export type DataTableFeatures = Features;

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<Features, TData, unknown>[];
  data: TData[];
  // Adds a leading checkbox column + bulk-action bar (Zoho list behaviour)
  enableSelection?: boolean;
  // Render prop: receives selected row ids (via getRowId) and a reset callback
  bulkActions?:
    | React.ReactNode
    | ((selectedIds: string[], clearSelection: () => void) => React.ReactNode);
  pageSize?: number;
  emptyMessage?: string;
  // Row id resolver; defaults to index. Pass e.g. (row) => row.id so bulk
  // actions receive real record ids.
  getRowId?: (row: TData, index: number) => string;
}

// Generic Zoho-style list table: sortable headers, checkbox selection with
// bulk-action bar, and a records/pagination footer.
function DataTable<TData extends RowData>({
  columns,
  data,
  enableSelection = true,
  bulkActions,
  pageSize = 25,
  emptyMessage = "No records found",
  getRowId: getRowIdProp,
}: DataTableProps<TData>) {
  const selectionColumn: ColumnDef<Features, TData, unknown> = {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && true)
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
  };

  const table = useTable({
    features,
    columns: enableSelection ? [selectionColumn, ...columns] : columns,
    data,
    enableRowSelection: true,
    getRowId: getRowIdProp ?? ((_row, index) => String(index)),
    initialState: { pagination: { pageIndex: 0, pageSize } },
  });

  const selectedCount = table.getSelectedRowModel().rows.length;
  const { pageIndex } = table.state.pagination;
  const pageCount = Math.max(1, table.getPageCount());

  const selectedIds = enableSelection
    ? table.getSelectedRowModel().rows.map((row) => row.id)
    : [];

  const resolveBulkActions =
    typeof bulkActions === "function"
      ? bulkActions(selectedIds, () => table.resetRowSelection())
      : bulkActions;

  return (
    <div className="flex flex-col gap-2">
      {enableSelection && selectedCount > 0 && (
        <div className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2">
          <p className="text-sm font-medium">
            {selectedCount} row{selectedCount > 1 ? "s" : ""} selected
          </p>
          <div className="flex items-center gap-2">{resolveBulkActions}</div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.column.getCanSort() ? (
                      <button
                        type="button"
                        className={cn(
                          "flex items-center gap-1 font-medium",
                          header.column.getCanSort() && "cursor-pointer",
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-muted-foreground">
          {data.length} record{data.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pageIndex + 1} of {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
