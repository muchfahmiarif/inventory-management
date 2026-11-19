"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Resolver, useFieldArray, useForm } from "react-hook-form";
import React from "react";

import {
  completeStockCount,
  createStockCount,
  deleteStockCount,
  deleteStockCounts,
} from "@/actions/stock-counts";
import DetailPageShell from "@/components/shared/detail-page";
import DataTable, {
  DataTableFeatures,
} from "@/components/shared/data-table";
import ListToolbar from "@/components/shared/list-toolbar";
import PageFormShell from "@/components/shared/page-form-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatQty } from "@/lib/format";
import {
  stockCountFormSchema,
  type StockCountFormInput,
} from "@/lib/schemas/stock-counts";

const FORM_ID = "stock-count-form";

// ---------- form ----------

export interface StockCountFormValues {
  date: string;
  warehouseId: string;
  notes?: string;
  lines: Array<{ itemId: string; countedQuantity?: string }>;
}

interface StockCountFormProps {
  defaultValues: StockCountFormValues;
  warehouses: { id: string; name: string }[];
  items: Array<{ id: string; name: string; sku: string | null }>;
  stockByItem: Record<string, number>;
}

const StockCountForm = ({
  defaultValues,
  warehouses,
  items,
  stockByItem,
}: StockCountFormProps) => {
  const form = useForm<StockCountFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(stockCountFormSchema) as unknown as Resolver<StockCountFormValues>,
    defaultValues,
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "lines" });

  const onSubmit = async (values: StockCountFormValues) => {
    await createStockCount(values as unknown as StockCountFormInput);
  };

  return (
    <PageFormShell title="New Stock Count" formId={FORM_ID}>
      <Form {...form}>
        <form
          id={FORM_ID}
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex max-w-4xl flex-col gap-4 pb-4"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date *</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="warehouseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Warehouse <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select warehouse" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {warehouses.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value ?? ""} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="rounded-md border">
            <div className="flex items-center justify-between rounded-t-md border-b bg-zinc-100 px-4 py-2 dark:bg-muted">
              <span className="text-sm font-medium">
                Items counted (leave counted blank to keep system qty)
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ itemId: "", countedQuantity: "" })}
              >
                <Plus className="mr-1 h-4 w-4" /> Add Item
              </Button>
            </div>
            <div className="flex flex-col gap-3 p-4">
              {fields.map((f, index) => {
                const itemId = form.watch(`lines.${index}.itemId`);
                const systemQty =
                  itemId && stockByItem[itemId] !== undefined ? stockByItem[itemId] : 0;
                return (
                  <div key={f.id} className="flex items-start gap-2">
                    <FormField
                      control={form.control}
                      name={`lines.${index}.itemId`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Item</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value ?? ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select item" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {items.map((o) => (
                                <SelectItem key={o.id} value={o.id}>
                                  {o.name}
                                  {o.sku ? ` (${o.sku})` : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="w-28">
                      <span className="text-sm font-medium">System</span>
                      <p className="flex h-10 items-center rounded-md border bg-muted px-3 text-sm">
                        {formatQty(systemQty)}
                      </p>
                    </div>
                    <FormField
                      control={form.control}
                      name={`lines.${index}.countedQuantity`}
                      render={({ field }) => (
                        <FormItem className="w-28">
                          <FormLabel>Counted</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} type="number" min={0} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remove line"
                      className="mt-8"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </form>
      </Form>
    </PageFormShell>
  );
};

// ---------- list ----------

export interface StockCountRow {
  id: string;
  number: string;
  date: string;
  status: "draft" | "completed";
  warehouseName: string | null;
}

function StockCountsList({ data }: { data: StockCountRow[] }) {
  const router = useRouter();

  const columns: ColumnDef<DataTableFeatures, StockCountRow, unknown>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      accessorKey: "number",
      header: "Count #",
      cell: ({ row }) => (
        <Link
          href={`/office/stock-counts/${row.original.id}`}
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
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "completed" ? "default" : "outline"}>
          <span className="capitalize">{row.original.status}</span>
        </Badge>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-2 px-2 pb-8">
      <ListToolbar
        className="sticky top-0 mx-2 my-4"
        left={<h2 className="px-2 text-xl font-medium">Stock Counts</h2>}
        right={
          <Button size={"sm"} onClick={() => router.push("/office/stock-counts/new")}>
            New
          </Button>
        }
      />
      <div className="mx-2">
        <DataTable
          columns={columns}
          data={data}
          getRowId={(row) => row.id}
          emptyMessage="No stock counts yet"
          bulkActions={(ids, clear) => (
            <Button
              size="sm"
              variant="destructive"
              onClick={async () => {
                if (window.confirm(`Delete ${ids.length} stock count(s)?`)) {
                  await deleteStockCounts(ids);
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

export interface StockCountDetailData {
  id: string;
  number: string;
  date: string;
  status: "draft" | "completed";
  notes: string | null;
  warehouseName: string | null;
  lines: Array<{
    id: string;
    itemName: string;
    systemQuantity: number;
    countedQuantity: number | null;
  }>;
}

function StockCountDetail({ data }: { data: StockCountDetailData }) {
  const router = useRouter();

  return (
    <DetailPageShell
      title={data.number}
      subtitle={formatDate(data.date)}
      status={data.status.charAt(0).toUpperCase() + data.status.slice(1)}
      statusVariant={data.status === "completed" ? "default" : "outline"}
      actionsMenu={null}
    >
      <div className="mt-4 flex flex-col gap-4">
        {data.status === "draft" && (
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => completeStockCount(data.id)}>
              <CheckCircle2 className="mr-1 h-4 w-4" /> Complete Count
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                if (window.confirm("Delete this draft stock count?")) {
                  await deleteStockCount(data.id);
                }
              }}
            >
              Delete
            </Button>
          </div>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">System Qty</TableHead>
                <TableHead className="text-right">Counted Qty</TableHead>
                <TableHead className="text-right">Variance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.lines.map((line) => {
                const counted = line.countedQuantity;
                const variance = counted === null ? null : counted - line.systemQuantity;
                return (
                  <TableRow key={line.id}>
                    <TableCell>{line.itemName}</TableCell>
                    <TableCell className="text-right">
                      {formatQty(line.systemQuantity)}
                    </TableCell>
                    <TableCell className="text-right">
                      {counted === null ? "-" : formatQty(counted)}
                    </TableCell>
                    <TableCell
                      className={`text-right ${
                        variance === null
                          ? ""
                          : variance > 0
                            ? "text-green-600"
                            : variance < 0
                              ? "text-red-500"
                              : ""
                      }`}
                    >
                      {variance === null
                        ? "-"
                        : `${variance > 0 ? "+" : ""}${formatQty(variance)}`}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/office/stock-counts")}
          >
            Back to Stock Counts
          </Button>
        </div>
      </div>
    </DetailPageShell>
  );
}

export { StockCountForm, StockCountsList, StockCountDetail };
