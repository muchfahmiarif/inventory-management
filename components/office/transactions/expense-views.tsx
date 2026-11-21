"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

import { deleteExpense, deleteExpenses } from "@/actions/expenses";
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

// ---------- list ----------

export interface ExpenseRow {
  id: string;
  number: string;
  date: string;
  description: string | null;
  vendorName: string | null;
  categoryName: string | null;
  amount: number;
}

function ExpensesList({ data, title }: { data: ExpenseRow[]; title: string }) {
  const router = useRouter();

  const columns: ColumnDef<DataTableFeatures, ExpenseRow, unknown>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      accessorKey: "number",
      header: "Expense #",
      cell: ({ row }) => (
        <Link
          href={`/office/purchases/expenses/${row.original.id}`}
          className="font-medium hover:text-primary hover:underline"
        >
          {row.original.number}
        </Link>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="line-clamp-1">{row.original.description ?? "-"}</span>
      ),
    },
    {
      accessorKey: "vendorName",
      header: "Vendor",
      cell: ({ row }) => row.original.vendorName ?? "-",
    },
    {
      accessorKey: "categoryName",
      header: "Category",
      cell: ({ row }) => row.original.categoryName ?? "-",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => formatMoney(row.original.amount),
    },
  ];

  return (
    <div className="flex flex-col gap-2 px-2 pb-8">
      <ListToolbar
        className="sticky top-0 mx-2 my-4"
        left={<h2 className="px-2 text-xl font-medium">{title}</h2>}
        right={
          <Button size={"sm"} onClick={() => router.push("/office/purchases/expenses/new")}>
            New
          </Button>
        }
      />
      <div className="mx-2">
        <DataTable
          columns={columns}
          data={data}
          getRowId={(row) => row.id}
          emptyMessage="No expenses yet"
          bulkActions={(ids, clear) => (
            <Button
              size="sm"
              variant="destructive"
              onClick={async () => {
                if (window.confirm(`Delete ${ids.length} expense(s)?`)) {
                  await deleteExpenses(ids);
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

export interface ExpenseDetailData {
  id: string;
  number: string;
  date: string;
  description: string | null;
  status: string;
  vendorName: string | null;
  categoryName: string | null;
  amount: number;
  notes: string | null;
}

function ExpenseDetail({ data }: { data: ExpenseDetailData }) {
  const router = useRouter();

  const row = (labelText: string, value: string | null) => (
    <div className="flex items-start justify-between gap-4 border-b py-2 last:border-b-0">
      <span className="text-sm uppercase tracking-wide text-muted-foreground">
        {labelText}
      </span>
      <span className="text-sm font-medium">{value ?? "-"}</span>
    </div>
  );

  return (
    <DetailPageShell
      title={data.number}
      subtitle={`${data.description ?? ""} · ${formatDate(data.date)}`}
      status={data.status.charAt(0).toUpperCase() + data.status.slice(1)}
      statusVariant="secondary"
      actionsMenu={null}
    >
      <div className="mt-4 max-w-3xl rounded-md border">
        <div className="rounded-t-md border-b bg-zinc-100 px-4 py-2 text-sm font-medium dark:bg-muted">
          Expense Details
        </div>
        <div className="px-4 py-2">
          {row("Description", data.description)}
          {row("Vendor", data.vendorName)}
          {row("Category", data.categoryName)}
          {row("Amount", formatMoney(data.amount))}
          {row("Notes", data.notes)}
        </div>
      </div>
      <div className="mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/office/purchases/expenses")}
        >
          Back to Expenses
        </Button>
      </div>
    </DetailPageShell>
  );
}

export { ExpensesList, ExpenseDetail };
